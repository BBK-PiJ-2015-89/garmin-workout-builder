import { GarminAuth, DBTokenStore } from 'garmin-auth';

const SPORT_RUNNING = { sportTypeId: 1, sportTypeKey: 'running' };
const NO_TARGET = { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' };
const PACE_TARGET = { workoutTargetTypeId: 6, workoutTargetTypeKey: 'pace.zone' };
const HR_TARGET = { workoutTargetTypeId: 4, workoutTargetTypeKey: 'heart.rate.zone' };

const STEP_TYPES = {
  warmup: { stepTypeId: 1, stepTypeKey: 'warmup' },
  active: { stepTypeId: 3, stepTypeKey: 'interval' },
  recovery: { stepTypeId: 4, stepTypeKey: 'recovery' },
  rest: { stepTypeId: 5, stepTypeKey: 'rest' },
  cooldown: { stepTypeId: 2, stepTypeKey: 'cooldown' },
};

const END_CONDITIONS = {
  open: { conditionTypeId: 1, conditionTypeKey: 'lap.button' },
  time: { conditionTypeId: 2, conditionTypeKey: 'time' },
  distance: { conditionTypeId: 3, conditionTypeKey: 'distance' },
};

function json(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

function parsePace(value) {
  const match = String(value ?? '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const mins = Number(match[1]);
  const secs = Number(match[2]);
  if (secs > 59) return null;
  return mins * 60 + secs;
}

function paceToMetresPerSecond(value) {
  const seconds = parsePace(value);
  return seconds ? 1000 / seconds : null;
}

function executableStep(step, order) {
  const durationType = step.durationType in END_CONDITIONS ? step.durationType : 'open';
  const out = {
    type: 'ExecutableStepDTO',
    stepOrder: order,
    stepType: STEP_TYPES[step.intensity] || STEP_TYPES.active,
    endCondition: END_CONDITIONS[durationType],
    targetType: NO_TARGET,
    targetValueOne: 0,
    targetValueTwo: 0,
    description: String(step.name || `Step ${order}`).slice(0, 128),
  };

  if (durationType !== 'open') out.endConditionValue = Number(step.durationValue);

  if (step.targetType === 'pace') {
    const fast = paceToMetresPerSecond(step.targetLow);
    const slow = paceToMetresPerSecond(step.targetHigh);
    if (!fast || !slow) throw new Error(`Invalid pace target in step ${order}`);
    out.targetType = PACE_TARGET;
    out.targetValueOne = Math.min(fast, slow); // slower speed
    out.targetValueTwo = Math.max(fast, slow); // faster speed
  } else if (step.targetType === 'heartRate') {
    const low = Number(step.targetLow);
    const high = Number(step.targetHigh);
    if (!low || !high || low > high) throw new Error(`Invalid heart-rate target in step ${order}`);
    out.targetType = HR_TARGET;
    out.targetValueOne = low;
    out.targetValueTwo = high;
  }

  return out;
}

function buildGarminSteps(inputSteps) {
  const top = [];

  for (const raw of inputSteps) {
    if (raw.kind !== 'repeat') {
      top.push(executableStep(raw, top.length + 1));
      continue;
    }

    const count = Number(raw.previousSteps);
    const reps = Number(raw.reps);
    if (!Number.isInteger(count) || count < 1 || count > top.length) {
      throw new Error('Repeat block points to an invalid number of previous steps');
    }
    if (!Number.isInteger(reps) || reps < 2 || reps > 99) {
      throw new Error('Repeat count must be between 2 and 99');
    }

    const children = top.splice(top.length - count, count).map((step, i) => ({ ...step, stepOrder: i + 1 }));
    top.push({
      type: 'RepeatGroupDTO',
      stepOrder: top.length + 1,
      stepType: { stepTypeId: 6, stepTypeKey: 'repeat' },
      numberOfIterations: reps,
      smartRepeat: false,
      endCondition: { conditionTypeId: 7, conditionTypeKey: 'iterations' },
      endConditionValue: reps,
      workoutSteps: children,
    });
  }

  return top.map((step, i) => ({ ...step, stepOrder: i + 1 }));
}

function buildWorkout(body) {
  if (!body || typeof body !== 'object') throw new Error('Missing workout body');
  const name = String(body.name || '').trim().slice(0, 80);
  if (!name) throw new Error('Workout name is required');
  if (body.sport && body.sport !== 'running') throw new Error('Only running workouts are supported in this version');
  if (!Array.isArray(body.steps) || body.steps.length < 1) throw new Error('At least one workout step is required');

  const workoutSteps = buildGarminSteps(body.steps);
  return {
    workoutName: name,
    sportType: SPORT_RUNNING,
    workoutSegments: [{ segmentOrder: 1, sportType: SPORT_RUNNING, workoutSteps }],
  };
}

function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

async function garminClient() {
  const url = databaseUrl();
  if (!url) throw new Error('DATABASE_URL is not configured. Use the same Postgres database as Hevy2Garmin.');
  const store = new DBTokenStore(url, process.env.GARMIN_TOKEN_PLATFORM || 'garmin_tokens');
  const auth = new GarminAuth({ store });
  return auth.client();
}

function deviceName(device) {
  return String(device?.displayName || device?.productDisplayName || device?.deviceName || device?.productName || 'Garmin device');
}

async function chooseDevice(client) {
  const configured = process.env.GARMIN_DEVICE_ID;
  if (configured) return { deviceId: configured, displayName: process.env.GARMIN_DEVICE_NAME || 'configured Garmin device' };

  const devices = await client.get('/device-service/deviceregistration/devices');
  const list = Array.isArray(devices) ? devices : [];
  const usable = list.filter(d => d && (d.deviceId || d.unitId));
  const fenix = usable.find(d => /f[ēe]nix\s*8/i.test(deviceName(d))) || usable.find(d => /f[ēe]nix/i.test(deviceName(d)));
  const chosen = fenix || (usable.length === 1 ? usable[0] : null);
  if (!chosen) return null;
  return { deviceId: chosen.deviceId || chosen.unitId, displayName: deviceName(chosen) };
}

async function pushWorkoutToDevice(client, workoutId, workoutName) {
  const device = await chooseDevice(client);
  if (!device) return { pushed: false, reason: 'Workout is in Garmin Connect, but no unique watch could be selected automatically.' };

  const payload = [{
    deviceId: device.deviceId,
    messageUrl: `workout-service/workout/FIT/${workoutId}`,
    messageType: 'workouts',
    groupName: null,
    messageName: workoutName,
    fileType: 'FIT',
    metaDataId: workoutId,
  }];
  await client.post('/device-service/devicemessage/messages', payload);
  return { pushed: true, deviceId: device.deviceId, deviceName: device.displayName };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      configured: Boolean(databaseUrl()),
      protected: Boolean(process.env.GARMIN_BUILDER_KEY),
    });
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const requiredKey = process.env.GARMIN_BUILDER_KEY;
  if (!requiredKey) return json(res, 503, { error: 'GARMIN_BUILDER_KEY is not configured on Vercel' });
  if (req.headers['x-builder-key'] !== requiredKey) return json(res, 401, { error: 'Invalid builder key' });

  try {
    const workout = buildWorkout(req.body);
    const client = await garminClient();
    const created = await client.post('/workout-service/workout', workout);
    const workoutId = created?.workoutId;
    if (!workoutId) throw new Error('Garmin created the workout but did not return a workoutId');

    let scheduledDate = null;
    if (req.body?.scheduleDate) {
      const date = String(req.body.scheduleDate);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Schedule date must be YYYY-MM-DD');
      await client.post(`/workout-service/schedule/${workoutId}`, { date });
      scheduledDate = date;
    }

    let devicePush = { pushed: false, reason: 'Watch push was not requested.' };
    if (req.body?.pushToWatch) {
      try {
        devicePush = await pushWorkoutToDevice(client, workoutId, workout.workoutName);
      } catch (error) {
        devicePush = { pushed: false, reason: `Workout saved to Garmin Connect, but watch push failed: ${error.message || error}` };
      }
    }

    return json(res, 200, {
      ok: true,
      workoutId,
      workoutName: workout.workoutName,
      scheduledDate,
      devicePush,
    });
  } catch (error) {
    console.error('send-to-garmin failed', error);
    return json(res, 500, { error: String(error?.message || error) });
  }
}

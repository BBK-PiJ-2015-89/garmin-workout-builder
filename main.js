import './style.css';
import { Encoder, Profile } from '@garmin/fitsdk';

const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const initialSteps = [
  { id: uid(), kind: 'step', name: 'Warm up', intensity: 'warmup', durationType: 'distance', durationValue: 2000, targetType: 'open', targetLow: '', targetHigh: '' },
  { id: uid(), kind: 'step', name: 'Tempo', intensity: 'active', durationType: 'distance', durationValue: 1000, targetType: 'pace', targetLow: '4:35', targetHigh: '4:45' },
  { id: uid(), kind: 'step', name: 'Easy', intensity: 'recovery', durationType: 'time', durationValue: 120, targetType: 'open', targetLow: '', targetHigh: '' },
  { id: uid(), kind: 'repeat', name: 'Repeat', previousSteps: 2, reps: 4 },
  { id: uid(), kind: 'step', name: 'Cool down', intensity: 'cooldown', durationType: 'distance', durationValue: 1500, targetType: 'open', targetLow: '', targetHigh: '' },
];

const state = {
  name: 'Great South Run Session',
  sport: 'running',
  steps: structuredClone(initialSteps),
  scheduleDate: '',
  pushToWatch: true,
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parsePace(value) {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (seconds > 59) return null;
  return minutes * 60 + seconds;
}

function paceToSpeed(pace) {
  const secondsPerKm = parsePace(pace);
  return secondsPerKm ? 1000 / secondsPerKm : null;
}

function formatDuration(step) {
  if (step.durationType === 'open') return 'Lap button';
  if (step.durationType === 'distance') {
    return step.durationValue >= 1000
      ? `${(step.durationValue / 1000).toFixed(step.durationValue % 1000 ? 1 : 0)} km`
      : `${step.durationValue} m`;
  }
  const mins = Math.floor(step.durationValue / 60);
  const secs = step.durationValue % 60;
  return mins ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;
}

function formatTarget(step) {
  if (step.targetType === 'pace') return `${step.targetLow || '?'} to ${step.targetHigh || '?'} /km`;
  if (step.targetType === 'heartRate') return `${step.targetLow || '?'} to ${step.targetHigh || '?'} bpm`;
  return 'No target';
}

function stepCard(step, index) {
  if (step.kind === 'repeat') {
    return `
      <article class="step-card repeat-card" data-id="${step.id}">
        <div class="step-number">${index + 1}</div>
        <div class="step-grid repeat-grid">
          <label>Repeat previous
            <input data-field="previousSteps" type="number" min="1" max="${Math.max(1, index)}" value="${step.previousSteps}">
            <span class="suffix">steps</span>
          </label>
          <label>Number of times
            <input data-field="reps" type="number" min="2" max="99" value="${step.reps}">
          </label>
        </div>
        <button class="icon-btn danger" data-action="delete" aria-label="Delete repeat">×</button>
      </article>`;
  }

  return `
    <article class="step-card" data-id="${step.id}">
      <div class="step-number">${index + 1}</div>
      <div class="step-grid">
        <label class="wide">Step name
          <input data-field="name" type="text" maxlength="32" value="${escapeHtml(step.name)}">
        </label>
        <label>Intensity
          <select data-field="intensity">
            ${['warmup','active','recovery','rest','cooldown'].map(v => `<option value="${v}" ${step.intensity === v ? 'selected' : ''}>${v[0].toUpperCase() + v.slice(1)}</option>`).join('')}
          </select>
        </label>
        <label>Duration
          <select data-field="durationType">
            <option value="distance" ${step.durationType === 'distance' ? 'selected' : ''}>Distance</option>
            <option value="time" ${step.durationType === 'time' ? 'selected' : ''}>Time</option>
            <option value="open" ${step.durationType === 'open' ? 'selected' : ''}>Until lap press</option>
          </select>
        </label>
        ${step.durationType === 'open' ? '' : `
          <label>${step.durationType === 'distance' ? 'Metres' : 'Seconds'}
            <input data-field="durationValue" type="number" min="1" step="1" value="${step.durationValue}">
          </label>`}
        <label>Target
          <select data-field="targetType">
            <option value="open" ${step.targetType === 'open' ? 'selected' : ''}>No target</option>
            <option value="pace" ${step.targetType === 'pace' ? 'selected' : ''}>Pace</option>
            <option value="heartRate" ${step.targetType === 'heartRate' ? 'selected' : ''}>Heart rate</option>
          </select>
        </label>
        ${step.targetType === 'pace' ? `
          <label>Fast pace
            <input data-field="targetLow" type="text" inputmode="numeric" placeholder="4:30" value="${escapeHtml(step.targetLow)}">
          </label>
          <label>Slow pace
            <input data-field="targetHigh" type="text" inputmode="numeric" placeholder="4:45" value="${escapeHtml(step.targetHigh)}">
          </label>` : ''}
        ${step.targetType === 'heartRate' ? `
          <label>HR low
            <input data-field="targetLow" type="number" min="40" max="220" value="${escapeHtml(step.targetLow)}">
          </label>
          <label>HR high
            <input data-field="targetHigh" type="number" min="40" max="220" value="${escapeHtml(step.targetHigh)}">
          </label>` : ''}
      </div>
      <div class="step-actions">
        <button class="icon-btn" data-action="up" ${index === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
        <button class="icon-btn" data-action="down" ${index === state.steps.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
        <button class="icon-btn danger" data-action="delete" aria-label="Delete step">×</button>
      </div>
    </article>`;
}

function summaryRows() {
  return state.steps.map((step, index) => {
    if (step.kind === 'repeat') {
      return `<div class="summary-row"><span>${index + 1}</span><strong>Repeat</strong><span>Previous ${step.previousSteps} steps × ${step.reps}</span></div>`;
    }
    return `<div class="summary-row"><span>${index + 1}</span><strong>${escapeHtml(step.name || 'Step')}</strong><span>${formatDuration(step)} · ${formatTarget(step)}</span></div>`;
  }).join('');
}

function render() {
  document.querySelector('#app').innerHTML = `
    <header class="hero">
      <div class="shell hero-inner">
        <div>
          <div class="eyebrow">FIT WORKOUT TOOL</div>
          <h1>Garmin Workout Builder</h1>
          <p>Build structured running sessions and export a Garmin-compatible <code>.FIT</code> workout file.</p>
        </div>
        <div class="fit-badge">FIT<br><small>21.214</small></div>
      </div>
    </header>

    <main class="shell layout">
      <section class="panel builder">
        <div class="panel-heading">
          <div>
            <h2>Workout</h2>
            <p>Configure the session Garmin will show step-by-step on the watch.</p>
          </div>
        </div>

        <div class="workout-meta">
          <label>Workout name
            <input id="workout-name" type="text" maxlength="32" value="${escapeHtml(state.name)}">
          </label>
          <label>Sport
            <select id="sport"><option value="running">Running</option></select>
          </label>
        </div>

        <div class="steps" id="steps">
          ${state.steps.map(stepCard).join('')}
        </div>

        <div class="add-row">
          <button class="secondary" id="add-step">+ Add step</button>
          <button class="secondary" id="add-repeat">↻ Add repeat</button>
        </div>
      </section>

      <aside class="panel summary-panel">
        <div class="sticky">
          <div class="eyebrow">PREVIEW</div>
          <h2>${escapeHtml(state.name)}</h2>
          <div class="summary-list">${summaryRows()}</div>
          <div class="garmin-options">
            <label>Schedule date <span class="muted">(optional)</span>
              <input id="schedule-date" type="date" value="${escapeHtml(state.scheduleDate)}">
            </label>
            <label class="check-row">
              <input id="push-to-watch" type="checkbox" ${state.pushToWatch ? 'checked' : ''}>
              <span>Push to my Garmin watch now</span>
            </label>
          </div>
          <div id="status" class="status" hidden></div>
          <button class="primary" id="send-garmin">Send to Garmin Connect</button>
          <button class="secondary full" id="export-fit">Download .FIT backup</button>
          <button class="ghost" id="reset">Reset example</button>
          <p class="hint">Garmin Connect upload uses your existing server-side DI OAuth session. The FIT download remains available as a fallback.</p>
        </div>
      </aside>
    </main>

    <footer class="shell footer">Workout editing runs in your browser. Garmin authentication tokens stay server-side and are never sent to the browser.</footer>
  `;
  bindEvents();
}

function updateStep(id, field, value) {
  const step = state.steps.find(s => s.id === id);
  if (!step) return;
  if (['durationValue','previousSteps','reps'].includes(field)) value = Number(value);
  step[field] = value;
}

function bindEvents() {
  document.querySelector('#workout-name').addEventListener('input', e => {
    state.name = e.target.value;
    document.querySelector('.summary-panel h2').textContent = state.name || 'Untitled workout';
  });

  document.querySelector('#steps').addEventListener('change', e => {
    const card = e.target.closest('[data-id]');
    const field = e.target.dataset.field;
    if (!card || !field) return;
    updateStep(card.dataset.id, field, e.target.value);
    render();
  });

  document.querySelector('#steps').addEventListener('input', e => {
    const card = e.target.closest('[data-id]');
    const field = e.target.dataset.field;
    if (!card || !field) return;
    updateStep(card.dataset.id, field, e.target.value);
  });

  document.querySelector('#steps').addEventListener('click', e => {
    const button = e.target.closest('[data-action]');
    const card = e.target.closest('[data-id]');
    if (!button || !card) return;
    const index = state.steps.findIndex(s => s.id === card.dataset.id);
    if (button.dataset.action === 'delete') state.steps.splice(index, 1);
    if (button.dataset.action === 'up' && index > 0) [state.steps[index - 1], state.steps[index]] = [state.steps[index], state.steps[index - 1]];
    if (button.dataset.action === 'down' && index < state.steps.length - 1) [state.steps[index + 1], state.steps[index]] = [state.steps[index], state.steps[index + 1]];
    render();
  });

  document.querySelector('#add-step').addEventListener('click', () => {
    state.steps.push({ id: uid(), kind: 'step', name: 'Run', intensity: 'active', durationType: 'distance', durationValue: 1000, targetType: 'open', targetLow: '', targetHigh: '' });
    render();
  });

  document.querySelector('#add-repeat').addEventListener('click', () => {
    if (!state.steps.length) return;
    state.steps.push({ id: uid(), kind: 'repeat', name: 'Repeat', previousSteps: Math.min(2, state.steps.length), reps: 4 });
    render();
  });

  document.querySelector('#reset').addEventListener('click', () => {
    state.name = 'Great South Run Session';
    state.steps = structuredClone(initialSteps).map(s => ({ ...s, id: uid() }));
    state.scheduleDate = '';
    state.pushToWatch = true;
    render();
  });

  document.querySelector('#schedule-date').addEventListener('change', e => { state.scheduleDate = e.target.value; });
  document.querySelector('#push-to-watch').addEventListener('change', e => { state.pushToWatch = e.target.checked; });
  document.querySelector('#send-garmin').addEventListener('click', sendToGarmin);
  document.querySelector('#export-fit').addEventListener('click', exportFit);
}

function validateWorkout() {
  const errors = [];
  if (!state.name.trim()) errors.push('Give the workout a name.');
  if (!state.steps.length) errors.push('Add at least one workout step.');

  state.steps.forEach((step, index) => {
    if (step.kind === 'repeat') {
      if (index === 0) errors.push(`Step ${index + 1}: a repeat cannot be the first step.`);
      if (step.previousSteps < 1 || step.previousSteps > index) errors.push(`Step ${index + 1}: repeat range is invalid.`);
      if (step.reps < 2) errors.push(`Step ${index + 1}: repeats must be at least 2.`);
      return;
    }
    if (step.durationType !== 'open' && (!Number.isFinite(step.durationValue) || step.durationValue <= 0)) errors.push(`Step ${index + 1}: duration must be greater than zero.`);
    if (step.targetType === 'pace') {
      const fast = parsePace(step.targetLow);
      const slow = parsePace(step.targetHigh);
      if (!fast || !slow) errors.push(`Step ${index + 1}: enter pace as m:ss, for example 4:45.`);
      if (fast && slow && fast > slow) errors.push(`Step ${index + 1}: fast pace must be quicker than slow pace.`);
    }
    if (step.targetType === 'heartRate') {
      const low = Number(step.targetLow);
      const high = Number(step.targetHigh);
      if (!low || !high || low > high) errors.push(`Step ${index + 1}: enter a valid heart-rate range.`);
    }
  });
  return errors;
}

function toFitStep(step, index) {
  if (step.kind === 'repeat') {
    return {
      messageIndex: index,
      durationType: 'repeatUntilStepsCmplt',
      // For a repeat step Garmin stores the message index to loop back to
      // in durationValue, and the repetition count in targetValue.
      durationValue: Math.max(0, index - step.previousSteps),
      targetType: 'open',
      targetValue: step.reps,
    };
  }

  const mesg = {
    messageIndex: index,
    wktStepName: step.name || `Step ${index + 1}`,
    intensity: step.intensity,
    durationType: step.durationType,
    targetType: step.targetType === 'heartRate' ? 'heartRate' : step.targetType === 'pace' ? 'speed' : 'open',
    targetValue: 0,
    customTargetValueLow: 0,
    customTargetValueHigh: 0,
  };

  // The JS encoder serialises the underlying FIT fields, not decoded subfield
  // aliases. FIT stores time in milliseconds and distance in centimetres.
  if (step.durationType === 'distance') mesg.durationValue = Math.round(Number(step.durationValue) * 100);
  if (step.durationType === 'time') mesg.durationValue = Math.round(Number(step.durationValue) * 1000);

  if (step.targetType === 'pace') {
    const fastSpeed = paceToSpeed(step.targetLow);
    const slowSpeed = paceToSpeed(step.targetHigh);
    mesg.customTargetValueLow = Math.round(Math.min(fastSpeed, slowSpeed) * 1000);
    mesg.customTargetValueHigh = Math.round(Math.max(fastSpeed, slowSpeed) * 1000);
  }

  if (step.targetType === 'heartRate') {
    // FIT workout_hr absolute bpm encoding is bpm + 100.
    mesg.customTargetValueLow = Number(step.targetLow) + 100;
    mesg.customTargetValueHigh = Number(step.targetHigh) + 100;
  }

  return mesg;
}

function createFitFile() {
  const encoder = new Encoder();
  const now = new Date();

  encoder.onMesg(Profile.MesgNum.FILE_ID, {
    type: 'workout',
    manufacturer: 'development',
    product: 0,
    serialNumber: Math.floor(Math.random() * 0xffffffff),
    timeCreated: now,
  });

  encoder.onMesg(Profile.MesgNum.WORKOUT, {
    sport: state.sport,
    numValidSteps: state.steps.length,
    wktName: state.name.trim().slice(0, 32),
  });

  state.steps.forEach((step, index) => {
    encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, toFitStep(step, index));
  });

  return encoder.close();
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workout';
}

function showStatus(message, type = 'error') {
  const el = document.querySelector('#status');
  el.hidden = false;
  el.className = `status ${type}`;
  el.innerHTML = message;
}

async function sendToGarmin() {
  const errors = validateWorkout();
  if (errors.length) {
    showStatus(`<strong>Check the workout:</strong><br>${errors.map(escapeHtml).join('<br>')}`);
    return;
  }

  let builderKey = sessionStorage.getItem('garminBuilderKey') || '';
  if (!builderKey) {
    builderKey = window.prompt('Enter your Garmin Workout Builder key. This is the GARMIN_BUILDER_KEY you set in Vercel.');
    if (!builderKey) return;
    sessionStorage.setItem('garminBuilderKey', builderKey);
  }

  const button = document.querySelector('#send-garmin');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Sending…';
  showStatus('Sending workout securely to Garmin Connect…', 'info');

  try {
    const response = await fetch('/api/send-to-garmin', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-builder-key': builderKey,
      },
      body: JSON.stringify({
        name: state.name.trim(),
        sport: state.sport,
        steps: state.steps.map(({ id, ...step }) => step),
        scheduleDate: state.scheduleDate || null,
        pushToWatch: state.pushToWatch,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (response.status === 401) {
      sessionStorage.removeItem('garminBuilderKey');
      throw new Error('Builder key rejected. Try Send again and enter the Vercel GARMIN_BUILDER_KEY.');
    }
    if (!response.ok) throw new Error(result.error || `Garmin request failed (${response.status})`);

    const parts = [`Created Garmin workout <strong>${escapeHtml(result.workoutName || state.name)}</strong>`];
    if (result.workoutId) parts.push(`ID ${escapeHtml(result.workoutId)}`);
    if (result.scheduledDate) parts.push(`scheduled for ${escapeHtml(result.scheduledDate)}`);
    if (result.devicePush?.pushed) parts.push(`queued for ${escapeHtml(result.devicePush.deviceName || 'your Garmin device')}`);
    else if (state.pushToWatch && result.devicePush?.reason) parts.push(escapeHtml(result.devicePush.reason));
    showStatus(parts.join(' · '), 'success');
  } catch (error) {
    console.error(error);
    showStatus(`Garmin Connect send failed: ${escapeHtml(error.message || error)}`);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function exportFit() {
  const errors = validateWorkout();
  if (errors.length) {
    showStatus(`<strong>Check the workout:</strong><br>${errors.map(escapeHtml).join('<br>')}`);
    return;
  }

  try {
    const bytes = createFitFile();
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(state.name)}.fit`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showStatus(`Created <strong>${escapeHtml(a.download)}</strong> with ${state.steps.length} FIT workout steps.`, 'success');
  } catch (error) {
    console.error(error);
    showStatus(`FIT export failed: ${escapeHtml(error.message || error)}`);
  }
}

render();

import "./style.css";
import { Encoder, Profile } from "@garmin/fitsdk";

const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const step = (
  name,
  intensity,
  durationType,
  durationValue,
  targetType = "open",
  targetLow = "",
  targetHigh = "",
) => ({
  id: uid(),
  kind: "step",
  name,
  intensity,
  durationType,
  durationValue,
  targetType,
  targetLow,
  targetHigh,
});

const repeat = (previousSteps, reps) => ({
  id: uid(),
  kind: "repeat",
  name: "Repeat",
  previousSteps,
  reps,
});

const initialSteps = [
  step("Warm up", "warmup", "distance", 2000),
  step("Tempo", "active", "distance", 1000, "pace", "4:35", "4:45"),
  step("Easy", "recovery", "time", 120),
  repeat(2, 4),
  step("Cool down", "cooldown", "distance", 1500),
];

const trainingPlan = [
  {
    id: "gsr-2026-09-10-club",
    date: "2026-09-10",
    type: "Club",
    title: "Thursday club run",
    description: "8–10 km steady with the club. Keep it controlled.",
    sync: false,
    steps: [step("Club run", "active", "distance", 9000)],
  },
  {
    id: "gsr-2026-09-14-club",
    date: "2026-09-14",
    type: "Club",
    title: "Monday club run",
    description: "Around 10 km at normal club pace.",
    sync: false,
    steps: [step("Club run", "active", "distance", 10000)],
  },
  {
    id: "gsr-2026-09-17-club",
    date: "2026-09-17",
    type: "Club",
    title: "Thursday club run",
    description: "8–10 km steady. Keep enough in reserve for Saturday.",
    sync: false,
    steps: [step("Club run", "active", "distance", 9000)],
  },
  {
    id: "gsr-2026-09-19-progression",
    date: "2026-09-19",
    type: "Structured",
    title: "13 km progression",
    description:
      "3 km easy, 6 km steady at 5:00–5:15/km, 2 km at 4:35–4:45/km, then 2 km easy.",
    sync: true,
    steps: [
      step("Easy start", "warmup", "distance", 3000),
      step("Steady", "active", "distance", 6000, "pace", "5:00", "5:15"),
      step(
        "10-mile effort",
        "active",
        "distance",
        2000,
        "pace",
        "4:35",
        "4:45",
      ),
      step("Easy finish", "cooldown", "distance", 2000),
    ],
  },

  {
    id: "gsr-2026-09-21-club",
    date: "2026-09-21",
    type: "Club",
    title: "Monday club run",
    description: "Around 10 km steady with the club.",
    sync: false,
    steps: [step("Club run", "active", "distance", 10000)],
  },
  {
    id: "gsr-2026-09-24-club",
    date: "2026-09-24",
    type: "Club",
    title: "Thursday club run",
    description: "8–10 km controlled ahead of Saturday.",
    sync: false,
    steps: [step("Club run", "active", "distance", 9000)],
  },
  {
    id: "gsr-2026-09-26-2k-reps",
    date: "2026-09-26",
    type: "Structured",
    title: "3 × 2 km",
    description:
      "2 km warm-up, 3 × 2 km at 4:30–4:40/km with 3 min recovery, then 2 km cool-down.",
    sync: true,
    steps: [
      step("Warm up", "warmup", "distance", 2000),
      step("2 km rep", "active", "distance", 2000, "pace", "4:30", "4:40"),
      step("Recovery", "recovery", "time", 180),
      repeat(2, 3),
      step("Cool down", "cooldown", "distance", 2000),
    ],
  },

  {
    id: "gsr-2026-09-28-club",
    date: "2026-09-28",
    type: "Club",
    title: "Monday club run",
    description: "Around 10 km steady.",
    sync: false,
    steps: [step("Club run", "active", "distance", 10000)],
  },
  {
    id: "gsr-2026-10-01-club",
    date: "2026-10-01",
    type: "Club",
    title: "Thursday club run",
    description: "8–10 km controlled. Avoid a hard finish.",
    sync: false,
    steps: [step("Club run", "active", "distance", 9000)],
  },
  {
    id: "gsr-2026-10-03-long",
    date: "2026-10-03",
    type: "Structured",
    title: "15 km long run",
    description:
      "11 km relaxed followed by 4 km at 4:45–4:55/km. Final substantial long run.",
    sync: true,
    steps: [
      step("Easy start", "warmup", "distance", 2000),
      step("Easy aerobic", "active", "distance", 9000),
      step("Strong finish", "active", "distance", 4000, "pace", "4:45", "4:55"),
    ],
  },

  {
    id: "gsr-2026-10-05-club",
    date: "2026-10-05",
    type: "Club",
    title: "Monday club run",
    description: "8–10 km easy to steady. Taper starts here.",
    sync: false,
    steps: [step("Club run", "active", "distance", 9000)],
  },
  {
    id: "gsr-2026-10-08-club",
    date: "2026-10-08",
    type: "Club",
    title: "Thursday club run",
    description: "About 8 km, deliberately comfortable.",
    sync: false,
    steps: [step("Easy club run", "active", "distance", 8000)],
  },
  {
    id: "gsr-2026-10-10-800s",
    date: "2026-10-10",
    type: "Structured",
    title: "6 × 800 m taper session",
    description:
      "2 km warm-up, 6 × 800 m at 4:20–4:30/km with 90 sec easy recovery, then 2 km cool-down.",
    sync: true,
    steps: [
      step("Warm up", "warmup", "distance", 2000),
      step("800 m rep", "active", "distance", 800, "pace", "4:20", "4:30"),
      step("Recovery", "recovery", "time", 90),
      repeat(2, 6),
      step("Cool down", "cooldown", "distance", 2000),
    ],
  },

  {
    id: "gsr-2026-10-12-club",
    date: "2026-10-12",
    type: "Club",
    title: "Monday easy club run",
    description: "6–8 km easy. Finish feeling fresh.",
    sync: false,
    steps: [step("Easy run", "active", "distance", 7000)],
  },
  {
    id: "gsr-2026-10-15-club",
    date: "2026-10-15",
    type: "Club",
    title: "Thursday easy club run",
    description: "Keep this very easy. Around 5–7 km is plenty.",
    sync: false,
    steps: [step("Easy run", "active", "distance", 6000)],
  },
  {
    id: "gsr-2026-10-17-tune",
    date: "2026-10-17",
    type: "Structured",
    title: "Race tune-up",
    description:
      "Very short easy run with 4 × 20 sec relaxed strides. This is just to loosen the legs.",
    sync: true,
    steps: [
      step("Easy run", "warmup", "distance", 3000),
      step("Stride", "active", "time", 20),
      step("Easy", "recovery", "time", 60),
      repeat(2, 4),
      step("Easy finish", "cooldown", "distance", 1000),
    ],
  },

  {
    id: "gsr-2026-10-18-race",
    date: "2026-10-18",
    type: "Race",
    title: "Great South Run",
    description: "Race day: 10 miles / 16.1 km.",
    sync: false,
    race: true,
    steps: [],
  },
];

const CUSTOM_PLAN_KEY = "garminCustomWorkoutsV1";
const PLAN_EDIT_KEY = "garminPlanEditsV1";
const HIDDEN_PLAN_KEY = "garminHiddenWorkoutsV1";

function loadCustomWorkouts() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_PLAN_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCustomWorkouts(items) {
  localStorage.setItem(CUSTOM_PLAN_KEY, JSON.stringify(items));
}

function loadPlanEdits() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_EDIT_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function savePlanEdits(edits) {
  localStorage.setItem(PLAN_EDIT_KEY, JSON.stringify(edits));
}

trainingPlan.push(...loadCustomWorkouts());

// Number every training session in plan order, including club runs; exclude race day.
function planName(item) {
  if (item.custom) return item.title;
  const day =
    trainingPlan
      .filter((session) => !session.race && !session.custom)
      .findIndex((session) => session.id === item.id) + 1;
  return item.race
    ? "Great South Run - Race Day"
    : `Great South Run - Training Day ${day} - ${item.title}`;
}

const seededSync = {};
let syncBusy = false;

function setSyncBusy(busy) {
  syncBusy = busy;
  document.querySelectorAll("button, input, select").forEach((el) => {
    if (busy) el.disabled = true;
  });
}

function rememberWorkout(item, result, payload) {
  const map = loadSyncMap();
  const previous = map[item.id];
  map[item.id] = {
    workoutId: result.workoutId,
    workoutName: result.workoutName || payload.name,
    scheduledDate: result.updated
      ? previous?.scheduledDate || null
      : result.scheduledDate,
    steps: payload.steps,
    warning:
      result.warning || (result.updated ? previous?.warning : null) || null,
  };
  saveSyncMap(map);
  if (state.editingPlanId === item.id) {
    state.editingWorkoutId = result.workoutId;
    state.scheduleDate = map[item.id].scheduledDate || "";
  }
}

const state = {
  name: "Great South Run Session",
  sport: "running",
  steps: structuredClone(initialSteps),
  scheduleDate: "",
  pushToWatch: true,
  editingPlanId: null,
  editingWorkoutId: null,
  stravaUpdates: {},
  sharedPlans: {},
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cloneSteps(steps) {
  return structuredClone(steps).map((s) => ({ ...s, id: uid() }));
}

function localDateISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

function loadSyncMap() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem("garminPlanSyncV1") || "{}") || {};
  } catch {
    saved = {};
  }

  let changed = false;

  for (const [id, value] of Object.entries(seededSync)) {
    if (!saved[id]) {
      saved[id] = value;
      changed = true;
    }
  }

  if (changed) {
    localStorage.setItem("garminPlanSyncV1", JSON.stringify(saved));
  }

  return saved;
}

function saveSyncMap(map) {
  localStorage.setItem("garminPlanSyncV1", JSON.stringify(map));
}

function loadHiddenPlanIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(HIDDEN_PLAN_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

function saveHiddenPlanIds(ids) {
  localStorage.setItem(HIDDEN_PLAN_KEY, JSON.stringify([...ids]));
}

function customIds() {
  return new Set(loadCustomWorkouts().map((item) => item.id));
}

function sharedPlanItems() {
  return Object.entries(state.sharedPlans || {})
    .filter(([, plan]) => plan)
    .map(([workoutId, plan]) => ({
      id: `shared-${workoutId}`,
      sourcePlanId: plan.planId || "",
      date: plan.scheduledDate || localDateISO(),
      type: "Shared",
      title: plan.sessionTitle || plan.workoutTitle || "Shared planned workout",
      description: plan.description || "Shared planned workout",
      sync: true,
      custom: true,
      sharedOnly: true,
      sharedWorkoutId: workoutId,
      steps: Array.isArray(plan.steps) ? plan.steps : [],
    }));
}

function currentPlanItems() {
  const ids = customIds();
  const hidden = loadHiddenPlanIds();
  const edits = loadPlanEdits();
  return [
    ...trainingPlan
      .filter((item) => (!item.custom || ids.has(item.id)) && !hidden.has(item.id))
      .map((item) => (edits[item.id] ? { ...item, ...edits[item.id], steps: cloneSteps(edits[item.id].steps || item.steps) } : item)),
    ...sharedPlanItems(),
  ];
}

function sortedPlanItems() {
  return currentPlanItems().sort((a, b) => `${a.date}-${a.title}`.localeCompare(`${b.date}-${b.title}`));
}

async function fetchStravaUpdates(promptForKey = false) {
  const builderKey = promptForKey ? getBuilderKey() : localStorage.getItem("garminBuilderKey") || "";
  if (!builderKey) return false;
  try {
    const response = await fetch("/api/plan-strava", { headers: { "x-builder-key": builderKey } });
    const data = await response.json();
    state.stravaUpdates = data.updates || {};
    state.sharedPlans = data.plans || {};
    return true;
  } catch {
    state.stravaUpdates = {};
    state.sharedPlans = {};
    return false;
  }
}

async function clearStravaUpdate(workoutId = "") {
  const builderKey = getBuilderKey();
  if (!builderKey) return;
  const url = workoutId ? `/api/plan-strava?workoutId=${encodeURIComponent(workoutId)}` : "/api/plan-strava";
  await fetch(url, { method: "DELETE", headers: { "x-builder-key": builderKey } });
  await fetchStravaUpdates();
  render();
}

function getBuilderKey() {
  let builderKey = localStorage.getItem("garminBuilderKey") || "";

  if (!builderKey) {
    builderKey = window.prompt(
      "Enter your H2G key. This is the H2G_SECRET you set in Vercel and Home Assistant.",
    );

    if (!builderKey) return "";

    localStorage.setItem("garminBuilderKey", builderKey);
  }

  return builderKey;
}

function parsePace(value) {
  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);

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

function formatDuration(s) {
  if (s.durationType === "open") return "Lap button";

  if (s.durationType === "distance") {
    return s.durationValue >= 1000
      ? `${(s.durationValue / 1000).toFixed(s.durationValue % 1000 ? 1 : 0)} km`
      : `${s.durationValue} m`;
  }

  const mins = Math.floor(s.durationValue / 60);
  const secs = s.durationValue % 60;

  return mins ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;
}

function formatTarget(s) {
  if (s.targetType === "pace") {
    return `${s.targetLow || "?"} to ${s.targetHigh || "?"} /km`;
  }

  if (s.targetType === "heartRate") {
    return `${s.targetLow || "?"} to ${s.targetHigh || "?"} bpm`;
  }

  return "No target";
}

function stepCard(s, index) {
  if (s.kind === "repeat") {
    return `
      <article class="step-card repeat-card" data-id="${s.id}">
        <div class="step-number">${index + 1}</div>

        <div class="step-grid repeat-grid">
          <label>
            Repeat previous
            <input
              data-field="previousSteps"
              type="number"
              min="1"
              max="${Math.max(1, index)}"
              value="${s.previousSteps}"
            >
            <span class="suffix">steps</span>
          </label>

          <label>
            Number of times
            <input
              data-field="reps"
              type="number"
              min="2"
              max="99"
              value="${s.reps}"
            >
          </label>
        </div>

        <button
          class="icon-btn danger"
          data-action="delete"
          aria-label="Delete repeat"
        >×</button>
      </article>
    `;
  }

  return `
    <article class="step-card" data-id="${s.id}">
      <div class="step-number">${index + 1}</div>

      <div class="step-grid">
        <label class="wide">
          Step name
          <input
            data-field="name"
            type="text"
            maxlength="32"
            value="${escapeHtml(s.name)}"
          >
        </label>

        <label>
          Intensity
          <select data-field="intensity">
            ${["warmup", "active", "recovery", "rest", "cooldown"]
              .map(
                (v) => `
                <option
                  value="${v}"
                  ${s.intensity === v ? "selected" : ""}
                >
                  ${v[0].toUpperCase() + v.slice(1)}
                </option>
              `,
              )
              .join("")}
          </select>
        </label>

        <label>
          Duration
          <select data-field="durationType">
            <option value="distance" ${s.durationType === "distance" ? "selected" : ""}>
              Distance
            </option>
            <option value="time" ${s.durationType === "time" ? "selected" : ""}>
              Time
            </option>
            <option value="open" ${s.durationType === "open" ? "selected" : ""}>
              Until lap press
            </option>
          </select>
        </label>

        ${
          s.durationType === "open"
            ? ""
            : `
            <label>
              ${s.durationType === "distance" ? "Metres" : "Seconds"}
              <input
                data-field="durationValue"
                type="number"
                min="1"
                step="1"
                value="${s.durationValue}"
              >
            </label>
          `
        }

        <label>
          Target
          <select data-field="targetType">
            <option value="open" ${s.targetType === "open" ? "selected" : ""}>
              No target
            </option>
            <option value="pace" ${s.targetType === "pace" ? "selected" : ""}>
              Pace
            </option>
            <option value="heartRate" ${s.targetType === "heartRate" ? "selected" : ""}>
              Heart rate
            </option>
          </select>
        </label>

        ${
          s.targetType === "pace"
            ? `
            <label>
              Fast pace
              <input
                data-field="targetLow"
                type="text"
                inputmode="numeric"
                placeholder="4:30"
                value="${escapeHtml(s.targetLow)}"
              >
            </label>

            <label>
              Slow pace
              <input
                data-field="targetHigh"
                type="text"
                inputmode="numeric"
                placeholder="4:45"
                value="${escapeHtml(s.targetHigh)}"
              >
            </label>
          `
            : ""
        }

        ${
          s.targetType === "heartRate"
            ? `
            <label>
              HR low
              <input
                data-field="targetLow"
                type="number"
                min="40"
                max="220"
                value="${escapeHtml(s.targetLow)}"
              >
            </label>

            <label>
              HR high
              <input
                data-field="targetHigh"
                type="number"
                min="40"
                max="220"
                value="${escapeHtml(s.targetHigh)}"
              >
            </label>
          `
            : ""
        }
      </div>

      <div class="step-actions">
        <button
          class="icon-btn"
          data-action="up"
          ${index === 0 ? "disabled" : ""}
          aria-label="Move up"
        >↑</button>

        <button
          class="icon-btn"
          data-action="down"
          ${index === state.steps.length - 1 ? "disabled" : ""}
          aria-label="Move down"
        >↓</button>

        <button
          class="icon-btn danger"
          data-action="delete"
          aria-label="Delete step"
        >×</button>
      </div>
    </article>
  `;
}

function summaryRows() {
  return state.steps
    .map((s, index) => {
      if (s.kind === "repeat") {
        return `
          <div class="summary-row">
            <span>${index + 1}</span>
            <strong>Repeat</strong>
            <span>Previous ${s.previousSteps} steps × ${s.reps}</span>
          </div>
        `;
      }

      return `
        <div class="summary-row">
          <span>${index + 1}</span>
          <strong>${escapeHtml(s.name || "Step")}</strong>
          <span>${formatDuration(s)} · ${formatTarget(s)}</span>
        </div>
      `;
    })
    .join("");
}

function planRows() {
  const syncMap = loadSyncMap();
  const today = localDateISO();

  return sortedPlanItems()
    .map((item) => {
      const synced = syncMap[item.id] || (item.sharedWorkoutId ? { workoutId: item.sharedWorkoutId, workoutName: item.title, scheduledDate: item.date, steps: item.steps } : null);
      const past = item.date < today;

      let badge = item.type;

      const stravaUpdated = synced?.workoutId && state.stravaUpdates[String(synced.workoutId)];
      if (stravaUpdated) badge = "✓ Strava";
      else if (synced) badge = "✓ Garmin";
      else if (item.race) badge = "Race";
      else if (past) badge = "Past";

      const syncButton = item.sync
        ? `
          <button
            class="secondary plan-sync-one"
            data-plan-id="${item.id}"
            ${synced ? "disabled" : ""}
          >
            ${synced ? "Synced" : "Sync to Garmin"}
          </button>
        `
        : "";

      const loadButton = item.race
        ? ""
        : `
          <button
            class="ghost plan-load"
            data-plan-id="${item.id}"
          >
            Load in builder
          </button>
        `;

      const deleteButton = item.race
        ? ""
        : `
          <button
            class="ghost danger plan-delete"
            data-plan-id="${item.id}"
          >
            Delete
          </button>
        `;

      const stravaButton = synced?.workoutId
        ? `
          <button class="ghost plan-force-strava" data-workout-id="${escapeHtml(synced.workoutId)}">
            Force Strava update
          </button>
        `
        : "";

      const syncDetail = synced?.workoutId
        ? `
          <div class="plan-sync-detail">
            Garmin ID ${escapeHtml(synced.workoutId)}
            ${synced.scheduledDate ? ` · ${escapeHtml(synced.scheduledDate)}` : ""}
            ${stravaUpdated ? " · Strava updated" : ""}
            ${synced.warning ? ` · ${escapeHtml(synced.warning)}` : ""}
          </div>
        `
        : "";

      return `
        <article class="plan-row ${item.type.toLowerCase()} ${past ? "past" : ""}">
          <div class="plan-date">
            ${escapeHtml(formatDate(item.date))}
          </div>

          <div class="plan-main">
            <div class="plan-title-line">
              <strong>${escapeHtml(planName(item))}</strong>
              <span class="plan-badge">${escapeHtml(badge)}</span>
            </div>

            <div class="plan-description">
              ${escapeHtml(item.description)}
            </div>

            ${syncDetail}
          </div>

          <div class="plan-actions">
            ${syncButton}
            ${stravaButton}
            ${loadButton}
            ${deleteButton}
          </div>
        </article>
      `;
    })
    .join("");
}

function render() {
  document.querySelector("#app").innerHTML = `
    <style>
      .plan-panel {
        margin: 24px auto;
      }

      .plan-toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        margin: 16px 0;
      }

      .plan-toolbar p {
        margin: 0;
        max-width: 720px;
      }

      .plan-list {
        display: grid;
        gap: 10px;
      }

      .plan-row {
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr) auto;
        gap: 16px;
        align-items: center;
        padding: 14px 16px;
        border: 1px solid rgba(127, 127, 127, .22);
        border-radius: 12px;
      }

      .plan-row.past {
        opacity: .72;
      }

      .plan-date {
        font-weight: 700;
        white-space: nowrap;
      }

      .plan-title-line {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .plan-description {
        margin-top: 4px;
        opacity: .78;
        line-height: 1.4;
      }

      .plan-badge {
        font-size: .78rem;
        border: 1px solid rgba(127, 127, 127, .3);
        border-radius: 999px;
        padding: 2px 8px;
        white-space: nowrap;
      }

      .plan-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .plan-sync-detail {
        font-size: .78rem;
        opacity: .65;
        margin-top: 5px;
      }

      .plan-status {
        margin: 12px 0;
      }

      @media (max-width: 760px) {
        .plan-row {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .plan-actions {
          justify-content: flex-start;
        }
      }
    </style>

    <header class="hero">
      <div class="shell hero-inner">
        <div>
          <div class="eyebrow">GARMIN TRAINING PLAN</div>
          <h1>Great South Run Plan</h1>
          <p>
            Your running schedule through 18 October, with structured sessions
            ready to schedule into Garmin Connect.
          </p>
        </div>

        <div class="fit-badge">
          FIT<br>
          <small>21.214</small>
        </div>
      </div>
    </header>

    <section class="shell panel plan-panel">
      <div class="panel-heading">
        <div>
          <h2>Training schedule</h2>
          <p>
            Two normal club runs each week plus one targeted session.
            Only the structured sessions are bulk-scheduled to Garmin.
          </p>
        </div>
      </div>

      <div class="plan-toolbar">
        <p class="hint">
          “Sync all upcoming” skips sessions already recorded as synced on this
          browser, so pressing it again will not recreate those workouts.
        </p>

        <button class="ghost" id="clear-plan-sync">
          Clear plan sync history
        </button>

        <button class="ghost" id="clear-strava-updates">
          Clear Strava update history
        </button>

        <button class="ghost" id="refresh-shared-records">
          Refresh shared records
        </button>

        <button class="primary" id="sync-plan">
          Sync all upcoming workouts
        </button>
      </div>

      <div
        id="plan-status"
        class="status plan-status"
        hidden
      ></div>

      <div class="plan-list">
        ${planRows()}
      </div>
    </section>

    <main class="shell layout">
      <section class="panel builder">
        <div class="panel-heading">
          <div>
            <h2>Workout builder</h2>
            <p>
              Load a planned session above to inspect or adjust it,
              or build something completely different.
            </p>
          </div>
        </div>

        <div class="workout-meta">
          <label>
            Workout name
            <input
              id="workout-name"
              type="text"
              maxlength="80"
              value="${escapeHtml(state.name)}"
            >
          </label>

          <label>
            Sport
            <select id="sport">
              <option value="running">Running</option>
            </select>
          </label>
        </div>

        <div class="steps" id="steps">
          ${state.steps.map(stepCard).join("")}
        </div>

        <div class="add-row">
          <button class="secondary" id="add-step">
            + Add step
          </button>

          <button class="secondary" id="add-repeat">
            ↻ Add repeat
          </button>
        </div>
      </section>

      <aside class="panel summary-panel">
        <div class="sticky">
          <div class="eyebrow">PREVIEW</div>

          <h2>${escapeHtml(state.name)}</h2>

          <div class="summary-list">
            ${summaryRows()}
          </div>

          <div class="garmin-options">
            <label>
              Schedule date
              <span class="muted">(optional)</span>
              <input
                id="schedule-date"
                type="date"
                value="${escapeHtml(state.scheduleDate)}"
                ${state.editingWorkoutId ? "disabled" : ""}
              >
            </label>

            ${state.editingWorkoutId ? '<p class="hint">Updating preserves the existing Garmin calendar entries. Change dates in Garmin Connect.</p>' : ""}
            <label class="check-row">
              <input
                id="push-to-watch"
                type="checkbox"
                ${state.pushToWatch ? "checked" : ""}
              >

              <span>Push to my Garmin watch now</span>
            </label>
          </div>

          <div
            id="status"
            class="status"
            hidden
          ></div>

          <button
            class="primary"
            id="send-garmin"
          >
            ${
              state.editingWorkoutId
                ? "Update Garmin Workout"
                : "Send to Garmin Connect"
            }
          </button>

          <button
            class="secondary full"
            id="save-workout-list"
          >
            Save to workout list
          </button>

          <button
            class="secondary full"
            id="export-fit"
          >
            Download .FIT backup
          </button>

          <button
            class="ghost"
            id="reset"
          >
            Reset example
          </button>

          <p class="hint">
            Bulk plan sync schedules future structured workouts but does not
            push every future workout to the watch immediately. Garmin calendar
            sync handles them on the relevant dates.
          </p>
        </div>
      </aside>
    </main>

    <footer class="shell footer">
      Garmin authentication tokens stay server-side.
      Your H2G key and local plan sync history are stored only in this browser.
    </footer>
  `;

  bindEvents();
  if (syncBusy) setSyncBusy(true);
}

function updateStep(id, field, value) {
  const s = state.steps.find((x) => x.id === id);

  if (!s) return;

  if (["durationValue", "previousSteps", "reps"].includes(field)) {
    value = Number(value);
  }

  s[field] = value;
}

function loadPlanWorkout(item) {
  const syncMap = loadSyncMap();
  const synced =
    syncMap[item.id] ||
    (item.sharedWorkoutId
      ? {
          workoutId: item.sharedWorkoutId,
          workoutName: item.title,
          scheduledDate: item.date,
          steps: item.steps,
        }
      : null);

  state.name =
    synced?.steps && synced.workoutName ? synced.workoutName : planName(item);
  state.sport = "running";
  state.steps = cloneSteps(synced?.steps || item.steps);
  state.scheduleDate = synced ? synced.scheduledDate || "" : item.date;
  state.pushToWatch = item.date === localDateISO();

  state.editingPlanId = item.id;
  state.editingWorkoutId = synced?.workoutId || null;

  render();

  setTimeout(() => {
    document.querySelector(".builder")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 0);
}

async function deleteWorkoutFromList(planId) {
  const item = currentPlanItems().find((x) => x.id === planId && !x.race);
  if (!item) return;
  if (!window.confirm(`Delete ${planName(item)} from this workout list${item.sharedWorkoutId ? " and shared Strava tracking" : ""}?`)) return;
  if (item.sharedWorkoutId) {
    const builderKey = getBuilderKey();
    if (builderKey) {
      await fetch(`/api/plan-strava?plannedWorkoutId=${encodeURIComponent(item.sharedWorkoutId)}`, {
        method: "DELETE",
        headers: { "x-builder-key": builderKey },
      });
      delete state.sharedPlans[String(item.sharedWorkoutId)];
    }
  }
  if (item.custom && !item.sharedOnly) {
    saveCustomWorkouts(loadCustomWorkouts().filter((x) => x.id !== planId));
    const index = trainingPlan.findIndex((x) => x.id === planId);
    if (index >= 0) trainingPlan.splice(index, 1);
  } else if (!item.sharedOnly) {
    const hidden = loadHiddenPlanIds();
    hidden.add(planId);
    saveHiddenPlanIds(hidden);
  }
  const syncMap = loadSyncMap();
  delete syncMap[planId];
  saveSyncMap(syncMap);
  if (state.editingPlanId === planId) {
    state.editingPlanId = null;
    state.editingWorkoutId = null;
  }
  render();
  showPlanStatus("Workout removed from this browser's list.", "success");
}

function saveCurrentWorkoutToList() {
  if (syncBusy) return;
  const errors = validateWorkout();
  if (errors.length) {
    showStatus(errors.join(" "), "error");
    return;
  }
  const existingPlan = trainingPlan.find((existing) => existing.id === state.editingPlanId);
  const existingSync = state.editingPlanId ? loadSyncMap()[state.editingPlanId] : null;
  const editingExisting = existingPlan && !existingPlan.sharedOnly;
  const item = {
    id: editingExisting ? existingPlan.id : `custom-${Date.now()}`,
    date: state.scheduleDate || existingSync?.scheduledDate || localDateISO(),
    type: existingPlan?.type || "Custom",
    title: state.name.trim(),
    description: existingPlan?.description || "Custom planned workout",
    sync: true,
    custom: existingPlan?.custom || !editingExisting,
    steps: cloneSteps(state.steps),
  };
  if (existingPlan?.custom || !editingExisting) {
    const custom = loadCustomWorkouts().filter((existing) => existing.id !== item.id);
    custom.push(item);
    saveCustomWorkouts(custom);
  } else {
    const edits = loadPlanEdits();
    edits[item.id] = {
      date: item.date,
      title: item.title,
      description: item.description,
      sync: item.sync,
      steps: cloneSteps(item.steps),
    };
    savePlanEdits(edits);
  }
  const existingIndex = trainingPlan.findIndex((existing) => existing.id === item.id);
  if (existingIndex >= 0) trainingPlan[existingIndex] = { ...trainingPlan[existingIndex], ...item };
  else trainingPlan.push(item);
  state.editingPlanId = item.id;
  state.editingWorkoutId = existingSync?.workoutId || state.editingWorkoutId || null;
  render();
  showPlanStatus(`<strong>${escapeHtml(item.title)}</strong> added to the workout list for ${escapeHtml(formatDate(item.date))}.`, "success");
}

function clearPlanSyncHistory() {
  if (syncBusy) return;
  const confirmed = window.confirm(
    "Clear this browser's plan sync history and saved plan edits? Your H2G key will be kept.\n\nThis does not delete workouts or calendar entries from Garmin Connect. Syncing again can create duplicates unless you have removed the old workouts there.",
  );
  if (!confirmed) return;

  try {
    localStorage.removeItem("garminPlanSyncV1");
    localStorage.removeItem(PLAN_EDIT_KEY);
    state.editingPlanId = null;
    state.editingWorkoutId = null;
    render();
    showPlanStatus(
      "Plan sync history cleared. Your H2G key was kept. You can now sync the plan again.",
      "success",
    );
  } catch {
    showPlanStatus(
      "Could not clear plan sync history. Check that this browser allows site storage and try again.",
      "error",
    );
  }
}

function bindEvents() {
  document.querySelector("#clear-plan-sync").addEventListener("click", clearPlanSyncHistory);
  document.querySelector("#clear-strava-updates").addEventListener("click", async () => {
    if (window.confirm("Clear all Strava update history? The next Hevy2Garmin sync may update matching Strava activities again.")) {
      await clearStravaUpdate();
      showPlanStatus("Strava update history cleared.", "success");
    }
  });
  document.querySelector("#refresh-shared-records").addEventListener("click", async () => {
    const loaded = await fetchStravaUpdates(true);
    render();
    const count = Object.keys(state.sharedPlans || {}).length;
    showPlanStatus(
      loaded
        ? `Loaded ${count} shared record${count === 1 ? "" : "s"}.`
        : "Could not load shared records. Check the H2G key and builder Vercel environment.",
      loaded ? "success" : "error",
    );
  });
  document.querySelector("#workout-name").addEventListener("input", (e) => {
    state.name = e.target.value;

    document.querySelector(".summary-panel h2").textContent =
      state.name || "Untitled workout";
  });

  document.querySelector("#steps").addEventListener("change", (e) => {
    const card = e.target.closest("[data-id]");
    const field = e.target.dataset.field;

    if (!card || !field) return;

    updateStep(card.dataset.id, field, e.target.value);
    render();
  });

  document.querySelector("#steps").addEventListener("input", (e) => {
    const card = e.target.closest("[data-id]");
    const field = e.target.dataset.field;

    if (!card || !field) return;

    updateStep(card.dataset.id, field, e.target.value);
  });

  document.querySelector("#steps").addEventListener("click", (e) => {
    const button = e.target.closest("[data-action]");
    const card = e.target.closest("[data-id]");

    if (!button || !card) return;

    const index = state.steps.findIndex((s) => s.id === card.dataset.id);

    if (button.dataset.action === "delete") {
      state.steps.splice(index, 1);
    }

    if (button.dataset.action === "up" && index > 0) {
      [state.steps[index - 1], state.steps[index]] = [
        state.steps[index],
        state.steps[index - 1],
      ];
    }

    if (button.dataset.action === "down" && index < state.steps.length - 1) {
      [state.steps[index + 1], state.steps[index]] = [
        state.steps[index],
        state.steps[index + 1],
      ];
    }

    render();
  });

  document.querySelector("#add-step").addEventListener("click", () => {
    state.steps.push(step("Run", "active", "distance", 1000));

    render();
  });

  document.querySelector("#add-repeat").addEventListener("click", () => {
    if (!state.steps.length) return;

    state.steps.push(repeat(Math.min(2, state.steps.length), 4));

    render();
  });

  document.querySelector("#reset").addEventListener("click", () => {
    state.editingPlanId = null;
    state.editingWorkoutId = null;
    state.name = "Great South Run Session";
    state.steps = cloneSteps(initialSteps);
    state.scheduleDate = "";
    state.pushToWatch = true;

    render();
  });

  document.querySelector("#schedule-date").addEventListener("change", (e) => {
    state.scheduleDate = e.target.value;
  });

  document.querySelector("#push-to-watch").addEventListener("change", (e) => {
    state.pushToWatch = e.target.checked;
  });

  document
    .querySelector("#send-garmin")
    .addEventListener("click", sendToGarmin);

  document.querySelector("#save-workout-list").addEventListener("click", saveCurrentWorkoutToList);

  document.querySelector("#export-fit").addEventListener("click", exportFit);

  document
    .querySelector("#sync-plan")
    .addEventListener("click", syncUpcomingPlan);

  document.querySelectorAll(".plan-load").forEach((button) => {
    button.addEventListener("click", () => {
      const item = currentPlanItems().find((x) => x.id === button.dataset.planId);

      if (item) {
        loadPlanWorkout(item);
      }
    });
  });

  document.querySelectorAll(".plan-delete").forEach((button) => {
    button.addEventListener("click", () => deleteWorkoutFromList(button.dataset.planId));
  });

  document.querySelectorAll(".plan-force-strava").forEach((button) => {
    button.addEventListener("click", async () => {
      await clearStravaUpdate(button.dataset.workoutId);
      showPlanStatus("Strava update marker cleared. Run Hevy2Garmin sync to force an update.", "success");
    });
  });

  document.querySelectorAll(".plan-sync-one").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = currentPlanItems().find((x) => x.id === button.dataset.planId);

      if (item) {
        await syncOnePlanItem(item);
      }
    });
  });
}

function validateWorkout(workout = state) {
  const errors = [];

  if (!workout.name.trim()) {
    errors.push("Give the workout a name.");
  }

  if (!workout.steps.length) {
    errors.push("Add at least one workout step.");
  }

  workout.steps.forEach((s, index) => {
    if (s.kind === "repeat") {
      if (index === 0) {
        errors.push(`Step ${index + 1}: a repeat cannot be the first step.`);
      }

      if (s.previousSteps < 1 || s.previousSteps > index) {
        errors.push(`Step ${index + 1}: repeat range is invalid.`);
      }

      if (s.reps < 2) {
        errors.push(`Step ${index + 1}: repeats must be at least 2.`);
      }

      return;
    }

    if (
      s.durationType !== "open" &&
      (!Number.isFinite(s.durationValue) || s.durationValue <= 0)
    ) {
      errors.push(`Step ${index + 1}: duration must be greater than zero.`);
    }

    if (s.targetType === "pace") {
      const fast = parsePace(s.targetLow);
      const slow = parsePace(s.targetHigh);

      if (!fast || !slow) {
        errors.push(`Step ${index + 1}: enter pace as m:ss, for example 4:45.`);
      }

      if (fast && slow && fast > slow) {
        errors.push(
          `Step ${index + 1}: fast pace must be quicker than slow pace.`,
        );
      }
    }

    if (s.targetType === "heartRate") {
      const low = Number(s.targetLow);
      const high = Number(s.targetHigh);

      if (!low || !high || low > high) {
        errors.push(`Step ${index + 1}: enter a valid heart-rate range.`);
      }
    }
  });

  return errors;
}

function toFitStep(s, index) {
  if (s.kind === "repeat") {
    return {
      messageIndex: index,
      durationType: "repeatUntilStepsCmplt",
      durationValue: Math.max(0, index - s.previousSteps),
      targetType: "open",
      targetValue: s.reps,
    };
  }

  const mesg = {
    messageIndex: index,
    wktStepName: s.name || `Step ${index + 1}`,
    intensity: s.intensity,
    durationType: s.durationType,
    targetType:
      s.targetType === "heartRate"
        ? "heartRate"
        : s.targetType === "pace"
          ? "speed"
          : "open",
    targetValue: 0,
    customTargetValueLow: 0,
    customTargetValueHigh: 0,
  };

  if (s.durationType === "distance") {
    mesg.durationValue = Math.round(Number(s.durationValue) * 100);
  }

  if (s.durationType === "time") {
    mesg.durationValue = Math.round(Number(s.durationValue) * 1000);
  }

  if (s.targetType === "pace") {
    const fastSpeed = paceToSpeed(s.targetLow);
    const slowSpeed = paceToSpeed(s.targetHigh);

    mesg.customTargetValueLow = Math.round(
      Math.min(fastSpeed, slowSpeed) * 1000,
    );

    mesg.customTargetValueHigh = Math.round(
      Math.max(fastSpeed, slowSpeed) * 1000,
    );
  }

  if (s.targetType === "heartRate") {
    mesg.customTargetValueLow = Number(s.targetLow) + 100;

    mesg.customTargetValueHigh = Number(s.targetHigh) + 100;
  }

  return mesg;
}

function createFitFile() {
  const encoder = new Encoder();
  const now = new Date();

  encoder.onMesg(Profile.MesgNum.FILE_ID, {
    type: "workout",
    manufacturer: "development",
    product: 0,
    serialNumber: Math.floor(Math.random() * 0xffffffff),
    timeCreated: now,
  });

  encoder.onMesg(Profile.MesgNum.WORKOUT, {
    sport: state.sport,
    numValidSteps: state.steps.length,
    wktName: state.name.trim().slice(0, 32),
  });

  state.steps.forEach((s, index) => {
    encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, toFitStep(s, index));
  });

  return encoder.close();
}

function slugify(value) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "workout"
  );
}

function showStatus(message, type = "error") {
  const el = document.querySelector("#status");

  el.hidden = false;
  el.className = `status ${type}`;
  el.innerHTML = message;
}

function showPlanStatus(message, type = "info") {
  const el = document.querySelector("#plan-status");

  el.hidden = false;
  el.className = `status plan-status ${type}`;
  el.innerHTML = message;
}

async function postWorkout(payload, builderKey) {
  const response = await fetch("/api/send-to-garmin", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-builder-key": builderKey,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("garminBuilderKey");

    throw new Error(
      "H2G key rejected. The saved key has been cleared; try again and enter the Vercel H2G_SECRET.",
    );
  }

  if (!response.ok) {
    throw new Error(
      result.error || `Garmin request failed (${response.status})`,
    );
  }

  if (
    !Number.isSafeInteger(Number(result.workoutId)) ||
    Number(result.workoutId) <= 0
  ) {
    throw new Error(
      "Garmin response had no valid workout ID. Check Garmin Connect before retrying.",
    );
  }
  return result;
}

function planPayload(item, pushToWatch = false) {
  const name = planName(item).slice(0, 80);
  return {
    name,
    sport: "running",
    steps: item.steps.map(({ id, ...s }) => s),
    scheduleDate: item.date,
    pushToWatch,
    planMeta: {
      planId: item.id,
      planName: item.custom ? "Custom Workouts" : "Great South Run",
      sessionTitle: item.title,
      workoutTitle: name,
      description: item.description,
    },
  };
}

async function syncOnePlanItem(item) {
  if (syncBusy || !item.sync) return;

  const syncMap = loadSyncMap();

  if (syncMap[item.id]) {
    showPlanStatus(
      `<strong>${escapeHtml(item.title)}</strong> is already marked as synced to Garmin.`,
      "info",
    );

    return;
  }

  const builderKey = getBuilderKey();

  if (!builderKey) return;

  setSyncBusy(true);
  showPlanStatus(
    `Scheduling <strong>${escapeHtml(item.title)}</strong> for ${escapeHtml(formatDate(item.date))}…`,
    "info",
  );

  let message;
  let status = "success";
  try {
    const payload = planPayload(item, item.date === localDateISO());
    const result = await postWorkout(payload, builderKey);
    rememberWorkout(item, result, payload);
    message = `<strong>${escapeHtml(payload.name)}</strong> saved · ID ${escapeHtml(result.workoutId)}.`;
    if (result.scheduledDate)
      message += ` Scheduled for ${escapeHtml(result.scheduledDate)}.`;
    if (result.warning) {
      message += ` ${escapeHtml(result.warning)}`;
      status = "info";
    }
    if (
      payload.pushToWatch &&
      !result.devicePush?.pushed &&
      result.devicePush?.reason
    ) {
      message += ` ${escapeHtml(result.devicePush.reason)}`;
    }
  } catch (error) {
    message = `Garmin sync failed: ${escapeHtml(error.message || error)}`;
    status = "error";
  } finally {
    syncBusy = false;
    render();
  }
  showPlanStatus(message, status);
}

async function syncUpcomingPlan() {
  if (syncBusy) return;
  const builderKey = getBuilderKey();

  if (!builderKey) return;

  const today = localDateISO();
  const syncMap = loadSyncMap();

  const upcoming = trainingPlan.filter(
    (item) => item.sync && item.date >= today && !syncMap[item.id],
  );

  if (!upcoming.length) {
    showPlanStatus(
      "All upcoming structured sessions in this plan are already marked as synced.",
      "success",
    );

    return;
  }

  const button = document.querySelector("#sync-plan");

  const original = button.textContent;

  setSyncBusy(true);

  let completed = 0;
  const failures = [];

  try {
    for (const item of upcoming) {
      button.textContent = `Syncing ${completed + 1}/${upcoming.length}…`;

      showPlanStatus(
        `Scheduling <strong>${escapeHtml(item.title)}</strong> for ${escapeHtml(formatDate(item.date))}…`,
        "info",
      );

      try {
        const result = await postWorkout(planPayload(item, false), builderKey);

        rememberWorkout(item, result, planPayload(item));
        if (result.warning) failures.push(`${item.title}: ${result.warning}`);

        completed += 1;
      } catch (error) {
        failures.push(`${item.title}: ${error.message || error}`);

        if (String(error.message || error).includes("H2G key rejected")) {
          break;
        }
      }
    }
  } finally {
    syncBusy = false;
    button.disabled = false;
    button.textContent = original;
  }

  render();

  setTimeout(() => {
    if (failures.length) {
      showPlanStatus(
        `<strong>Synced ${completed} workout${completed === 1 ? "" : "s"}.</strong><br>${failures.map(escapeHtml).join("<br>")}`,
        completed ? "info" : "error",
      );
    } else {
      showPlanStatus(
        `<strong>Done.</strong> Scheduled ${completed} upcoming structured workout${completed === 1 ? "" : "s"} in Garmin Connect.`,
        "success",
      );
    }
  }, 0);
}

async function sendToGarmin() {
  if (syncBusy) return;
  const errors = validateWorkout();

  if (errors.length) {
    showStatus(
      `<strong>Check the workout:</strong><br>${errors.map(escapeHtml).join("<br>")}`,
    );

    return;
  }

  const builderKey = getBuilderKey();

  if (!builderKey) return;

  const payload = {
    workoutId: state.editingWorkoutId,
    name: state.name.trim(),
    sport: state.sport,
    steps: state.steps.map(({ id, ...s }) => s),
    scheduleDate: state.editingWorkoutId ? null : state.scheduleDate || null,
    pushToWatch: state.pushToWatch,
  };
  const planItem = trainingPlan.find((item) => item.id === state.editingPlanId);
  const safeName = state.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  payload.planMeta = {
    planId: planItem?.id || `manual-${state.scheduleDate || localDateISO()}-${safeName}`,
    planName: planItem?.custom ? "Custom Workouts" : "Great South Run",
    sessionTitle: planItem?.title || state.name.trim(),
    workoutTitle: payload.name,
    description: planItem?.description || "Custom planned workout",
  };
  setSyncBusy(true);
  showStatus("Saving workout to Garmin Connect…", "info");
  let message;
  let status = "success";
  try {
    const result = await postWorkout(payload, builderKey);
    state.editingWorkoutId = result.workoutId;
    if (!result.updated) state.scheduleDate = result.scheduledDate || "";
    if (planItem) rememberWorkout(planItem, result, payload);
    const parts = [
      `${result.updated ? "Updated" : "Created"} <strong>${escapeHtml(result.workoutName || payload.name)}</strong>`,
      `ID ${escapeHtml(result.workoutId)}`,
    ];
    if (result.updated) parts.push("existing calendar entries preserved");
    if (result.scheduledDate)
      parts.push(`scheduled for ${escapeHtml(result.scheduledDate)}`);
    if (result.warning) {
      parts.push(escapeHtml(result.warning));
      status = "info";
    }
    if (result.devicePush?.pushed)
      parts.push(`queued for ${escapeHtml(result.devicePush.deviceName)}`);
    else if (payload.pushToWatch && result.devicePush?.reason)
      parts.push(escapeHtml(result.devicePush.reason));
    message = parts.join(" · ");
  } catch (error) {
    message = `Garmin save failed: ${escapeHtml(error.message || error)}`;
    status = "error";
  } finally {
    syncBusy = false;
    render();
  }
  showStatus(message, status);
}

function exportFit() {
  const errors = validateWorkout();

  if (errors.length) {
    showStatus(
      `<strong>Check the workout:</strong><br>${errors.map(escapeHtml).join("<br>")}`,
    );

    return;
  }

  try {
    const bytes = createFitFile();

    const blob = new Blob([bytes], {
      type: "application/octet-stream",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `${slugify(state.name)}.fit`;

    document.body.appendChild(a);

    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    showStatus(
      `Created <strong>${escapeHtml(a.download)}</strong> with ${state.steps.length} FIT workout steps.`,
      "success",
    );
  } catch (error) {
    console.error(error);

    showStatus(`FIT export failed: ${escapeHtml(error.message || error)}`);
  }
}

fetchStravaUpdates().finally(render);


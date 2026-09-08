# Garmin Workout Builder

A small Vite web app for building structured running workouts and exporting them as Garmin FIT workout files.

## What it does

- Builds running workouts from distance, time and open-ended steps.
- Supports warm-up, active, recovery, rest and cool-down intensities.
- Supports custom pace targets and heart-rate targets.
- Supports repeat blocks using FIT's `repeatUntilStepsCmplt` workout step.
- Exports a `.fit` file entirely in the browser using Garmin's official `@garmin/fitsdk` JavaScript package.
- Is ready to deploy on Vercel.

## Run locally

```bash
npm install
npm run dev
```

Then open the local address shown by Vite.

## Build

```bash
npm run build
```

## Put a workout on a Garmin watch by USB

1. Build the workout in the app and select **Download .FIT workout**.
2. Connect the Garmin watch to the computer by USB.
3. Open the Garmin device storage.
4. Copy the downloaded `.fit` file into `GARMIN/NewFiles`.
5. Safely eject the watch.
6. On the watch, open **Run > Training > Workouts** and select the imported workout.

The exact menu wording can vary by Garmin model and software version.

## Deploy to Vercel

Import this GitHub repository into Vercel. Vercel should detect Vite automatically. No environment variables are required.

## FIT implementation

This build targets Garmin FIT JavaScript SDK profile `21.214.0` and writes:

- `FILE_ID` with file type `workout`
- `WORKOUT`
- one `WORKOUT_STEP` message per configured step

The encoder is given the underlying FIT workout fields used in Garmin's official workout encoding recipe:

- time duration: `durationValue = seconds × 1000`
- distance duration: `durationValue = metres × 100`
- pace target: `customTargetValueLow/High = metres/second × 1000`, with target type `speed`
- heart-rate target: `customTargetValueLow/High = bpm + 100`, with target type `heartRate`
- repeat: `durationValue = message index to repeat from`, `targetValue = repetitions`

## Security

This project contains no Garmin username, password, API key, token or other account secret. FIT generation happens locally in the browser.

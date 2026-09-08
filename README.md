# Garmin Workout Builder

Browser-based structured running workout builder with two delivery paths:

1. **Send to Garmin Connect** using the existing DI OAuth tokens stored by Hevy2Garmin.
2. **Download `.FIT`** as a fallback for manual USB copy to `GARMIN/NewFiles`.

## Garmin Connect integration

The serverless endpoint at `api/send-to-garmin.js` uses `garmin-auth` and `DBTokenStore`. This means it can reuse the Garmin tokens already stored by the Hevy2Garmin web app in the `platform_credentials` Postgres table under platform `garmin_tokens`.

### Required Vercel environment variables

- `DATABASE_URL`: the **same Postgres connection string used by Hevy2Garmin**. `POSTGRES_URL` is also accepted.
- `GARMIN_BUILDER_KEY`: a new random secret you choose. The web app asks for it on first send and holds it only in browser `sessionStorage`.

Optional:

- `GARMIN_TOKEN_PLATFORM`: defaults to `garmin_tokens`. Leave this alone if sharing Hevy2Garmin's token row.
- `GARMIN_DEVICE_ID`: force a particular Garmin device. If omitted, the endpoint looks for a Fenix 8/Fenix device, or uses the only registered device when there is exactly one.
- `GARMIN_DEVICE_NAME`: friendly name shown after a forced-device push.

Do **not** put Garmin passwords or DI OAuth tokens in the repository or in frontend `VITE_*` variables.

## What Send to Garmin does

- Converts the browser workout into Garmin's structured workout JSON.
- POSTs it to `/workout-service/workout`.
- If a date is chosen, schedules it with `/workout-service/schedule/{workoutId}`.
- If **Push to my Garmin watch now** is selected, queues the FIT workout through Garmin's device-message service.

The Garmin Connect endpoints are private/unofficial and can change without notice.

## Local development

```bash
npm install
npm run dev
```

Vite serves the frontend locally. The `/api` function is designed for Vercel; use `vercel dev` if you want to exercise the serverless endpoint locally.

## Build

```bash
npm run build
```

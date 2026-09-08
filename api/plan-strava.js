import pg from "pg";

let pool;
function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.STORAGE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) return null;
  if (!pool) pool = new pg.Pool({ connectionString, ssl: connectionString.includes("sslmode=require") ? undefined : { rejectUnauthorized: false } });
  return pool;
}

function json(res, status, body) {
  res.status(status).setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

function authorised(req) {
  const secret = process.env.GARMIN_BUILDER_KEY;
  return secret && req.headers["x-builder-key"] === secret;
}

export default async function handler(req, res) {
  if (!authorised(req)) return json(res, 401, { error: "Unauthorized" });
  const db = getPool();
  if (!db) return json(res, 200, { updates: {} });

  if (req.method === "GET") {
    const rows = await db.query("SELECT value FROM app_cache WHERE key = $1 LIMIT 1", ["planned_strava_updates"]);
    return json(res, 200, { updates: rows.rows[0]?.value || {} });
  }

  if (req.method === "DELETE") {
    const workoutId = req.query?.workoutId ? String(req.query.workoutId) : "";
    if (!workoutId) {
      await db.query("DELETE FROM app_cache WHERE key = $1", ["planned_strava_updates"]);
      return json(res, 200, { cleared: "all" });
    }
    const rows = await db.query("SELECT value FROM app_cache WHERE key = $1 LIMIT 1", ["planned_strava_updates"]);
    const updates = rows.rows[0]?.value && typeof rows.rows[0].value === "object" ? rows.rows[0].value : {};
    delete updates[workoutId];
    await db.query(
      `INSERT INTO app_cache (key, value, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      ["planned_strava_updates", JSON.stringify(updates)],
    );
    return json(res, 200, { cleared: workoutId });
  }

  return json(res, 405, { error: "Method not allowed" });
}

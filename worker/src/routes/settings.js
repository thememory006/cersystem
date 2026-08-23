import { Hono } from 'hono';

export const settingsRoutes = new Hono();

// GET /api/settings
// Fetch all system settings
settingsRoutes.get('/', async (c) => {
  try {
    const { results } = await c.env.DB
      .prepare('SELECT key, value FROM settings')
      .all();

    const settings = {};
    for (const row of results) {
      settings[row.key] = row.value;
    }

    return c.json({ success: true, settings });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// PUT /api/settings
// Update system settings (admin only)
settingsRoutes.put('/', async (c) => {
  try {
    const body = await c.req.json();
    const keys = Object.keys(body);

    if (keys.length === 0) {
      return c.json({ success: false, error: 'No settings provided' }, 400);
    }

    // TODO: Verify admin role from token
    const updated_by = 'admin'; 

    // Update settings one by one
    for (const key of keys) {
      await c.env.DB
        .prepare(`
          INSERT INTO settings (key, value, updated_at, updated_by)
          VALUES (?, ?, datetime('now'), ?)
          ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at,
            updated_by = excluded.updated_by
        `)
        .bind(key, String(body[key]), updated_by)
        .run();
    }

    return c.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

import { Hono } from 'hono';

export const usersRoutes = new Hono();

// POST /api/users/sync
// Sync Firebase user to D1 and return role
usersRoutes.post('/sync', async (c) => {
  try {
    const body = await c.req.json();
    const { id, email, name, avatar_url } = body;

    if (!id || !email) {
      return c.json({ success: false, error: 'Missing required user fields' }, 400);
    }

    // Determine role based on specific admin emails
    const adminEmails = ['thememory003@gmail.com', 'thememory006@gmail.com'];
    const role = adminEmails.includes(email) ? 'admin' : 'user';

    // Upsert user into D1
    await c.env.DB
      .prepare(`
        INSERT INTO users (id, email, name, avatar_url, role, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          avatar_url = excluded.avatar_url,
          role = excluded.role,
          last_login = datetime('now')
      `)
      .bind(id, email, name || '', avatar_url || '', role)
      .run();

    return c.json({ success: true, user: { id, email, name, avatar_url, role } });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

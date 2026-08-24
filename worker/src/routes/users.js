import { Hono } from 'hono';

export const usersRoutes = new Hono();

// GET /api/users — ดึงรายชื่อผู้ใช้ทั้งหมด (Admin Only)
usersRoutes.get('/', async (c) => {
  try {
    const { results } = await c.env.DB
      .prepare('SELECT id, email, name, avatar_url, role, created_at, last_login FROM users ORDER BY created_at DESC')
      .all();
    return c.json({ success: true, users: results });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/users/sync — Sync Firebase user to D1 and return role
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

// PUT /api/users/:id/role — เปลี่ยน role ของผู้ใช้ (Admin Only)
usersRoutes.put('/:id/role', async (c) => {
  try {
    const { id } = c.req.param();
    const { role } = await c.req.json();

    if (!['admin', 'user'].includes(role)) {
      return c.json({ success: false, error: 'Invalid role' }, 400);
    }

    await c.env.DB
      .prepare('UPDATE users SET role = ? WHERE id = ?')
      .bind(role, id)
      .run();

    return c.json({ success: true, message: 'Role updated' });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/users/:id — ลบผู้ใช้ (Admin Only)
usersRoutes.delete('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'User deleted' });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

import { Hono } from 'hono';

export const certificatesRoutes = new Hono();

// GET /api/certificates
// Fetch certificates with optional filters (e.g. ?userId=123)
certificatesRoutes.get('/', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    let query = 'SELECT * FROM certificates';
    let params = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    // Map DB rows to match Frontend expectation (e.g., date formats, naming)
    const certificates = results.map(row => ({
      id: row.id,
      user_id: row.user_id,
      user_name: row.user_name,
      user_avatar: row.user_avatar,
      owner_type: row.owner_type,
      item_type: row.item_type,
      level: row.level,
      ocr_text: row.ocr_text,
      image_url: row.image_url || row.drive_url, // Fallback to drive_url if image_url is missing
      drive_url: row.drive_url,
      likes: row.likes,
      views: row.views,
      created_at: row.created_at,
      date: new Date(row.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
    }));

    return c.json({ success: true, certificates });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/certificates/:id
certificatesRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  try {
    // TODO: Verify if user owns this cert or is admin
    await c.env.DB.prepare('DELETE FROM certificates WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

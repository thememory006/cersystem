import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { driveRoutes } from './routes/drive.js';
import { settingsRoutes } from './routes/settings.js';
import { certificatesRoutes } from './routes/certificates.js';
import { usersRoutes } from './routes/users.js';

const app = new Hono();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use('*', logger());

app.use('*', cors({
  origin: (origin) => {
    return origin; // อนุญาตทุกโดเมน (เพื่อให้ใช้ XAMPP localhost ได้)
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (c) => c.json({
  service: 'SchoolPort API',
  version: '1.0.0',
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.route('/api/drive', driveRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/certificates', certificatesRoutes);
app.route('/api/users', usersRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

// ─── Error Handler ───────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;

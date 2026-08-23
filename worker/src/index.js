import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { driveRoutes } from './routes/drive.js';

const app = new Hono();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use('*', logger());

app.use('*', cors({
  origin: (origin, c) => {
    const allowed = c.env.CORS_ORIGIN || 'http://localhost:5173';
    return origin === allowed ? origin : null;
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

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

// ─── Error Handler ───────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;

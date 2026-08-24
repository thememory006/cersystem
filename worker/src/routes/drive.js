import { Hono } from 'hono';
import { GoogleDriveService } from '../services/googleDrive.js';

export const driveRoutes = new Hono();

// ─── Helper: parse Service Account from Worker secret ──────────────────────
function getDriveService(env) {
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON secret is not configured');
  }
  const serviceAccount = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return new GoogleDriveService(serviceAccount);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/drive/config
// ดึง Folder ID ทั้งหมดที่ตั้งค่าไว้
// ─────────────────────────────────────────────────────────────────────────────
driveRoutes.get('/config', async (c) => {
  try {
    const { results } = await c.env.DB
      .prepare('SELECT owner_type, folder_id, updated_at, updated_by FROM drive_config ORDER BY owner_type')
      .all();

    // Build map: { "ครู": { folder_id, updated_at }, ... }
    const config = {};
    for (const row of results) {
      config[row.owner_type] = {
        folder_id:  row.folder_id,
        updated_at: row.updated_at,
        updated_by: row.updated_by,
      };
    }

    return c.json({ success: true, config });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/drive/service-account
// ดึงอีเมลของ Service Account ไปแสดงให้ User เพื่อเอาไปแชร์
// ─────────────────────────────────────────────────────────────────────────────
driveRoutes.get('/service-account', (c) => {
  try {
    if (!c.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return c.json({ success: false, error: 'ยังไม่ได้ตั้งค่า GOOGLE_SERVICE_ACCOUNT_JSON' }, 500);
    }
    const sa = JSON.parse(c.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return c.json({ success: true, email: sa.client_email });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/drive/config
// บันทึกหรืออัปเดต Folder ID สำหรับ owner_type หนึ่งอัน
// Body: { owner_type: string, folder_id: string }
// ─────────────────────────────────────────────────────────────────────────────
driveRoutes.put('/config', async (c) => {
  const VALID_OWNER_TYPES = ['สถานศึกษา', 'ผู้บริหาร', 'ครู', 'นักเรียน'];

  try {
    const body = await c.req.json();
    const { owner_type, folder_id } = body;

    if (!owner_type || !VALID_OWNER_TYPES.includes(owner_type)) {
      return c.json({
        success: false,
        error: `owner_type ต้องเป็นหนึ่งใน: ${VALID_OWNER_TYPES.join(', ')}`
      }, 400);
    }
    if (!folder_id || folder_id.trim().length < 10) {
      return c.json({ success: false, error: 'folder_id ไม่ถูกต้อง' }, 400);
    }

    // TODO: ดึง user_id จาก JWT token (Phase 3)
    const updated_by = null;

    await c.env.DB
      .prepare(`
        INSERT INTO drive_config (owner_type, folder_id, updated_at, updated_by)
        VALUES (?, ?, datetime('now'), ?)
        ON CONFLICT(owner_type) DO UPDATE SET
          folder_id  = excluded.folder_id,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by
      `)
      .bind(owner_type, folder_id.trim(), updated_by)
      .run();

    return c.json({
      success: true,
      message: `บันทึก Folder ID สำหรับ "${owner_type}" เรียบร้อย`,
      data: { owner_type, folder_id: folder_id.trim() },
    });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/drive/test/:folderId
// ทดสอบว่า Service Account เข้าถึง Folder ID ได้หรือไม่
// ─────────────────────────────────────────────────────────────────────────────
driveRoutes.post('/test/:folderId', async (c) => {
  const { folderId } = c.req.param();

  try {
    const drive = getDriveService(c.env);
    const result = await drive.testFolderAccess(folderId);

    return c.json({
      success: true,
      folder_id: folderId,
      folder_name: result.name,
      message: `✅ เชื่อมต่อสำเร็จ: "${result.name}"`,
    });
  } catch (err) {
    return c.json({
      success: false,
      folder_id: folderId,
      error: err.message,
      message: '❌ ไม่สามารถเข้าถึงโฟลเดอร์นี้ได้',
    }, 403);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/drive/upload
// อัปโหลดรูปภาพไปยัง D1 Database โดยตรง
// Body: FormData { image: File (or base64 string), owner_type, item_type, level, ocr_text, user_name, user_id, base64_image }
// ─────────────────────────────────────────────────────────────────────────────
driveRoutes.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const owner_type = formData.get('owner_type');
    const item_type  = formData.get('item_type');
    const level      = formData.get('level');
    const description = formData.get('description') || '';
    const ocr_text   = formData.get('ocr_text') || '';
    const user_name  = formData.get('user_name') || 'ไม่ระบุ';
    const user_id    = formData.get('user_id')   || 'anonymous';
    const base64_image = formData.get('base64_image'); 

    console.log('Received formData keys:', [...formData.keys()]);
    console.log('base64_image length:', base64_image ? base64_image.length : 'MISSING');

    if (!base64_image || !owner_type) {
      return c.json({ success: false, error: 'กรุณาส่งรูปภาพ(base64_image) และ owner_type' }, 400);
    }

    const certId   = crypto.randomUUID();

    // 1. บันทึกรูปภาพแบบ Base64 ลงใน certificate_images
    await c.env.DB
      .prepare('INSERT INTO certificate_images (id, image_base64) VALUES (?, ?)')
      .bind(certId, base64_image)
      .run();

    // 2. บันทึกข้อมูล Metadata ลงใน certificates
    const origin = new URL(c.req.url).origin;
    const imageUrl = `${origin}/api/drive/image/${certId}`;

    await c.env.DB
      .prepare(`
        INSERT INTO certificates
          (id, user_id, user_name, owner_type, item_type, level, ocr_text, image_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(certId, user_id, user_name, owner_type, item_type, level, ocr_text, imageUrl)
      .run();

    return c.json({
      success: true,
      message: 'อัปโหลดเกียรติบัตรสำเร็จ!',
      data: {
        id: certId,
        user_id,
        user_name,
        owner_type,
        item_type,
        level,
        ocr_text,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        likes: 0,
        views: 0
      },
    });

  } catch (err) {
    console.error('Upload error:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/drive/image/:id
// ดึงรูปภาพจากฐานข้อมูล D1 มาแสดงผล
// ─────────────────────────────────────────────────────────────────────────────
driveRoutes.get('/image/:id', async (c) => {
  const { id } = c.req.param();
  try {
    const row = await c.env.DB
      .prepare('SELECT image_base64, mime_type FROM certificate_images WHERE id = ?')
      .bind(id)
      .first();

    if (!row) return c.notFound();

    const base64Data = row.image_base64.replace(/^data:image\/\w+;base64,/, "");
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    c.header('Content-Type', row.mime_type || 'image/jpeg');
    c.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    return c.body(bytes.buffer);
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

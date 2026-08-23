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
    const updated_by = 'admin';

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
// อัปโหลดรูปภาพ + JSON ไปยัง Drive folder ที่ถูกต้องตาม owner_type
// Body: FormData { image: File, owner_type, item_type, level, ocr_text, user_name, user_id }
// ─────────────────────────────────────────────────────────────────────────────
driveRoutes.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile  = formData.get('image');
    const owner_type = formData.get('owner_type');
    const item_type  = formData.get('item_type');
    const level      = formData.get('level');
    const ocr_text   = formData.get('ocr_text') || '';
    const user_name  = formData.get('user_name') || 'ไม่ระบุ';
    const user_id    = formData.get('user_id')   || 'anonymous';

    if (!imageFile || !owner_type) {
      return c.json({ success: false, error: 'กรุณาส่งรูปภาพและ owner_type' }, 400);
    }

    // 1. ดึง Folder ID จาก D1
    const configRow = await c.env.DB
      .prepare('SELECT folder_id FROM drive_config WHERE owner_type = ?')
      .bind(owner_type)
      .first();

    if (!configRow) {
      return c.json({
        success: false,
        error: `ยังไม่ได้ตั้งค่า Google Drive Folder สำหรับ "${owner_type}" — กรุณาตั้งค่าในหน้า Settings ก่อน`
      }, 422);
    }

    const folderId = configRow.folder_id;

    // 2. สร้าง UUID และชื่อไฟล์
    const certId   = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName  = `cert_${timestamp}_${certId.slice(0, 8)}`;

    // 3. อัปโหลดรูปภาพไป Drive
    const drive        = getDriveService(c.env);
    const imageBytes   = await imageFile.arrayBuffer();
    const imageMime    = imageFile.type || 'image/jpeg';
    const imageResult  = await drive.uploadFile(
      folderId,
      `${baseName}.jpg`,
      imageBytes,
      imageMime
    );

    // 4. สร้าง JSON metadata แล้วอัปโหลด
    const certData = {
      id:            certId,
      user_id,
      user_name,
      owner_type,
      item_type,
      level,
      ocr_text,
      drive_image_id: imageResult.id,
      drive_image_url: imageResult.webViewLink,
      created_at:    new Date().toISOString(),
    };
    const jsonBytes  = new TextEncoder().encode(JSON.stringify(certData, null, 2));
    const jsonResult = await drive.uploadFile(
      folderId,
      `${baseName}.json`,
      jsonBytes.buffer,
      'application/json'
    );

    // 5. บันทึก metadata ลง D1
    await c.env.DB
      .prepare(`
        INSERT INTO certificates
          (id, user_id, user_name, owner_type, item_type, level, ocr_text,
           drive_image_id, drive_json_id, drive_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(
        certId, user_id, user_name, owner_type, item_type, level, ocr_text,
        imageResult.id, jsonResult.id, imageResult.webViewLink
      )
      .run();

    return c.json({
      success: true,
      message: 'อัปโหลดเกียรติบัตรสำเร็จ!',
      data: {
        certificate_id: certId,
        drive_folder:   `https://drive.google.com/drive/folders/${folderId}`,
        drive_image:    imageResult.webViewLink,
        drive_json:     jsonResult.webViewLink,
        owner_type,
        saved_files: [`${baseName}.jpg`, `${baseName}.json`],
      },
    });

  } catch (err) {
    console.error('Upload error:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

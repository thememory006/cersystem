-- ═══════════════════════════════════════════════════════════════════════════
-- SchoolPort — Cloudflare D1 Schema
-- รัน: wrangler d1 execute schoolport-db --file=src/db/schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Drop tables (for re-run) ────────────────────────────────────────────────
-- DROP TABLE IF EXISTS certificates;
-- DROP TABLE IF EXISTS drive_config;
-- DROP TABLE IF EXISTS settings;
-- DROP TABLE IF EXISTS users;

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: settings
-- เก็บข้อมูลการตั้งค่าระบบส่วนกลาง (เช่น Logo URL, ฟอนต์)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,            -- e.g. 'logo_url', 'primary_font'
  value       TEXT NOT NULL,               -- e.g. 'https://...', 'Inter'
  updated_at  TEXT DEFAULT (datetime('now')),
  updated_by  TEXT                         -- user.id ของ Admin
);

-- Seed default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('logo_url', '');

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: users
-- เก็บข้อมูลผู้ใช้จาก Firebase Authentication
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,            -- Firebase UID
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'user',         -- 'user' | 'admin'
  created_at  TEXT DEFAULT (datetime('now')),
  last_login  TEXT DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: drive_config
-- เก็บ Google Drive Folder ID แยกตามประเภทเจ้าของ (owner_type)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drive_config (
  owner_type  TEXT PRIMARY KEY,            -- 'สถานศึกษา' | 'ผู้บริหาร' | 'ครู' | 'นักเรียน'
  folder_id   TEXT NOT NULL,               -- Google Drive Folder ID (e.g. '1BxiMYour...')
  updated_at  TEXT DEFAULT (datetime('now')),
  updated_by  TEXT,                        -- user.id ของ Admin ที่ตั้งค่า
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed default rows (Admin ต้องเติม folder_id ทีหลัง)
INSERT OR IGNORE INTO drive_config (owner_type, folder_id) VALUES
  ('สถานศึกษา', ''),
  ('ผู้บริหาร',  ''),
  ('ครู',        ''),
  ('นักเรียน',   '');

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: certificate_images
-- เก็บรูปภาพเกียรติบัตร (Base64) แยกต่างหากเพื่อไม่ให้ Query ตารางหลักอืด
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificate_images (
  id              TEXT PRIMARY KEY,            -- ตรงกับ certificates.id
  image_base64    TEXT NOT NULL,               -- ข้อมูล Base64 ที่บีบอัดแล้ว
  mime_type       TEXT DEFAULT 'image/jpeg'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Table: certificates
-- เกียรติบัตรแต่ละใบ
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  -- ─── Identity ───────────────────────────────────────────────────────────
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id         TEXT NOT NULL,
  user_name       TEXT NOT NULL,
  user_avatar     TEXT,

  -- ─── Classification ─────────────────────────────────────────────────────
  owner_type      TEXT NOT NULL CHECK(owner_type IN ('สถานศึกษา','ผู้บริหาร','ครู','นักเรียน')),
  item_type       TEXT NOT NULL CHECK(item_type  IN ('อบรม/พัฒนาตนเอง','รางวัล/การแข่งขัน')),
  level           TEXT NOT NULL CHECK(level      IN ('สถานศึกษา','เขตพื้นที่การศึกษา','ภาค','ประเทศ','นานาชาติ')),

  -- ─── Content ────────────────────────────────────────────────────────────
  ocr_text        TEXT DEFAULT '',          -- ข้อความที่ได้จาก Google Vision OCR
  image_url       TEXT,                     -- URL ของรูปภาพ (สามารถเป็น D1 API endpoint)

  -- ─── Legacy Drive References (Keep for backward compatibility) ───────────
  drive_image_id  TEXT,
  drive_json_id   TEXT,
  drive_url       TEXT,

  -- ─── Engagement ─────────────────────────────────────────────────────────
  likes           INTEGER DEFAULT 0,
  views           INTEGER DEFAULT 0,

  -- ─── Timestamps ─────────────────────────────────────────────────────────
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),

  -- ─── Foreign Keys ────────────────────────────────────────────────────────
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE
  -- Removed strict foreign key on owner_type to allow flexibility
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_certs_owner_type  ON certificates(owner_type);
CREATE INDEX IF NOT EXISTS idx_certs_item_type   ON certificates(item_type);
CREATE INDEX IF NOT EXISTS idx_certs_level        ON certificates(level);
CREATE INDEX IF NOT EXISTS idx_certs_user_id      ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certs_created_at   ON certificates(created_at DESC);

-- ─── Trigger: auto-update updated_at ─────────────────────────────────────────
CREATE TRIGGER IF NOT EXISTS trg_cert_updated
AFTER UPDATE ON certificates
FOR EACH ROW
BEGIN
  UPDATE certificates SET updated_at = datetime('now') WHERE id = OLD.id;
END;

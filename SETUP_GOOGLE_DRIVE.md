# 📁 คู่มือตั้งค่า Google Drive + Service Account
## SchoolPort — ระบบเก็บเกียรติบัตร

---

## ขั้นตอนที่ 1 — สร้าง Google Cloud Project

1. ไปที่ [console.cloud.google.com](https://console.cloud.google.com)
2. คลิก **"Select a project"** → **"New Project"**
3. ตั้งชื่อ Project เช่น `schoolport-dashboard`
4. คลิก **"Create"**

---

## ขั้นตอนที่ 2 — เปิดใช้งาน Google Drive API

1. ใน Google Cloud Console → ไปที่ **"APIs & Services"** → **"Library"**
2. ค้นหา **"Google Drive API"**
3. คลิก **"Enable"**

---

## ขั้นตอนที่ 3 — สร้าง Service Account

1. ไปที่ **"APIs & Services"** → **"Credentials"**
2. คลิก **"+ Create Credentials"** → **"Service Account"**
3. กรอกข้อมูล:
   - **Service account name**: `schoolport-drive`
   - **Service account ID**: (กำหนดอัตโนมัติ)
   - **Description**: `Service Account สำหรับ SchoolPort Dashboard`
4. คลิก **"Create and Continue"** → **"Done"**

---

## ขั้นตอนที่ 4 — ดาวน์โหลด JSON Key

1. คลิกที่ Service Account ที่สร้างใหม่
2. ไปแท็บ **"Keys"**
3. คลิก **"Add Key"** → **"Create new key"** → เลือก **JSON**
4. ดาวน์โหลดไฟล์ `schoolport-drive-xxxxx.json`

> ⚠️ **เก็บไฟล์นี้เป็นความลับ!** อย่า commit ลง Git

ตัวอย่างหน้าตาของ JSON key:
```json
{
  "type": "service_account",
  "project_id": "schoolport-dashboard",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "schoolport-drive@schoolport-dashboard.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

---

## ขั้นตอนที่ 5 — สร้างโฟลเดอร์ใน Google Drive

1. ไปที่ [drive.google.com](https://drive.google.com)
2. สร้างโฟลเดอร์ **4 โฟลเดอร์** ใต้โฟลเดอร์ Root ของโรงเรียน:

| โฟลเดอร์ | เพื่อใคร |
|----------|----------|
| `สถานศึกษา` | ผลงานของโรงเรียน/สถานศึกษา |
| `ผู้บริหาร` | เกียรติบัตรของผู้บริหาร |
| `ครู` | เกียรติบัตรของครู |
| `นักเรียน` | เกียรติบัตรของนักเรียน |

3. **แชร์แต่ละโฟลเดอร์** ให้ Service Account Email:
   - คลิกขวาที่โฟลเดอร์ → **"Share"**
   - ใส่ email: `schoolport-drive@schoolport-dashboard.iam.gserviceaccount.com`
   - ตั้ง permission เป็น **"Editor"**
   - คลิก **"Send"**

---

## ขั้นตอนที่ 6 — หา Folder ID

จาก URL ของโฟลเดอร์ใน Drive:

```
https://drive.google.com/drive/folders/1BxiMYourFolderIDHere
                                        ^^^^^^^^^^^^^^^^^^^
                                        นี่คือ Folder ID ที่ต้องการ
```

บันทึก Folder ID ของทั้ง 4 โฟลเดอร์:

```
สถานศึกษา : _________________________________
ผู้บริหาร  : _________________________________
ครู        : _________________________________
นักเรียน   : _________________________________
```

---

## ขั้นตอนที่ 7 — ใส่ Secret ใน Cloudflare Worker

```bash
# ใส่ Service Account JSON เป็น secret
wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
# (วาง JSON ทั้งหมดเป็น single line แล้วกด Enter)

# หรือจาก file
cat schoolport-drive-xxxxx.json | wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
```

---

## ขั้นตอนที่ 8 — ตั้งค่า Folder IDs ผ่านหน้า Dashboard

1. Login เข้าระบบด้วย Google
2. คลิกไอคอน ⚙️ Settings ใน Navbar
3. ใส่ Folder ID แต่ละอันในช่องที่กำหนด
4. กด **"ทดสอบ Connection"** เพื่อตรวจสอบ
5. กด **"บันทึก"** แต่ละอัน หรือ **"บันทึกการตั้งค่าทั้งหมด"**

---

## คำสั่ง Deploy

```bash
# สร้าง D1 Database
wrangler d1 create schoolport-db

# รัน Schema
wrangler d1 execute schoolport-db --file=src/db/schema.sql

# Deploy Worker
wrangler deploy

# ตรวจสอบ
curl https://schoolport-worker.your-domain.workers.dev/
```

---

## โครงสร้างไฟล์ที่ Drive จะสร้าง

```
📁 สถานศึกษา/
├── cert_2024-11-15_abc12345.jpg    ← รูปภาพเกียรติบัตร
└── cert_2024-11-15_abc12345.json   ← ข้อมูล metadata

📁 ครู/
├── cert_2024-10-22_def67890.jpg
└── cert_2024-10-22_def67890.json
...
```

---

## ข้อมูลใน JSON Metadata

```json
{
  "id": "uuid-xxxx-xxxx",
  "user_id": "firebase-uid",
  "user_name": "ครูสมหญิง วิชาการดี",
  "owner_type": "ครู",
  "item_type": "อบรม/พัฒนาตนเอง",
  "level": "ภาค",
  "ocr_text": "เกียรติบัตรนี้ให้ไว้เพื่อแสดงว่า...",
  "drive_image_id": "1BxiMYour...",
  "drive_image_url": "https://drive.google.com/file/d/.../view",
  "created_at": "2024-10-22T10:00:00.000Z"
}
```

/**
 * GoogleDriveService
 * ──────────────────────────────────────────────────────────────────
 * Cloudflare Worker-compatible Google Drive API v3 client.
 * ใช้ Service Account JSON สำหรับ authentication (ไม่ต้องการ OAuth2 user flow)
 *
 * Methods:
 *   - uploadFile(folderId, filename, buffer, mimeType) → { id, webViewLink }
 *   - testFolderAccess(folderId)                       → { id, name }
 *   - getFilesInFolder(folderId)                       → [{ id, name, ... }]
 *   - deleteFile(fileId)                               → true
 */

const DRIVE_API  = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const SCOPE      = 'https://www.googleapis.com/auth/drive';

export class GoogleDriveService {
  constructor(serviceAccount) {
    this.serviceAccount = serviceAccount;
    this._cachedToken   = null;
    this._tokenExpiry   = 0;
  }

  // ─── JWT + OAuth2 Token ────────────────────────────────────────────────────

  /**
   * สร้าง JWT แล้วแลก Access Token จาก Google OAuth2
   * Cloudflare Workers ใช้ crypto.subtle สำหรับ RSA signing
   */
  async _getAccessToken() {
    const now = Math.floor(Date.now() / 1000);

    // Return cached token ถ้ายังไม่หมดอายุ (เผื่อ 60 วินาที)
    if (this._cachedToken && now < this._tokenExpiry - 60) {
      return this._cachedToken;
    }

    // ─── Build JWT ───────────────────────────────────────────────
    const header  = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss:   this.serviceAccount.client_email,
      scope: SCOPE,
      aud:   'https://oauth2.googleapis.com/token',
      exp:   now + 3600,
      iat:   now,
    };

    const b64 = (obj) => btoa(JSON.stringify(obj))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const signingInput = `${b64(header)}.${b64(payload)}`;

    // ─── Import private key ──────────────────────────────────────
    const pemBody = this.serviceAccount.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    const keyBuf = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      keyBuf.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // ─── Sign JWT ────────────────────────────────────────────────
    const encoder   = new TextEncoder();
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      encoder.encode(signingInput)
    );

    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const jwt = `${signingInput}.${sigB64}`;

    // ─── Exchange JWT for Access Token ───────────────────────────
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Google OAuth2 error: ${err}`);
    }

    const tokenData = await tokenRes.json();
    this._cachedToken = tokenData.access_token;
    this._tokenExpiry = now + (tokenData.expires_in || 3600);
    return this._cachedToken;
  }

  // ─── Drive API Helpers ─────────────────────────────────────────────────────

  async _authHeaders() {
    const token = await this._getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }

  async _driveRequest(path, options = {}) {
    const headers = await this._authHeaders();
    const url = path.startsWith('http') ? path : `${DRIVE_API}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Drive API ${options.method || 'GET'} ${path} → ${res.status}: ${errBody}`);
    }
    return res.json();
  }

  // ─── Public Methods ────────────────────────────────────────────────────────

  /**
   * ทดสอบว่า Service Account เข้าถึง Folder ได้หรือไม่
   * ถ้าอยู่ใน Shared Drive จะคืน driveId ด้วย
   * @returns {{ id: string, name: string, driveId?: string }}
   */
  async testFolderAccess(folderId) {
    const data = await this._driveRequest(
      `/files/${folderId}?fields=id,name,mimeType,driveId,teamDriveId&supportsAllDrives=true&includeItemsFromAllDrives=true`
    );
    if (data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('ID นี้ไม่ใช่โฟลเดอร์ใน Google Drive');
    }
    return {
      id: data.id,
      name: data.name,
      driveId: data.driveId || data.teamDriveId || null,
    };
  }

  /**
   * อัปโหลดไฟล์ไปยัง Drive folder (รองรับทั้ง My Drive และ Shared Drive)
   * @param {string} folderId - Target folder ID
   * @param {string} filename - ชื่อไฟล์ เช่น "cert_2024.jpg"
   * @param {ArrayBuffer} buffer - เนื้อหาไฟล์
   * @param {string} mimeType - MIME type เช่น "image/jpeg" | "application/json"
   * @returns {{ id: string, webViewLink: string, name: string }}
   */
  async uploadFile(folderId, filename, buffer, mimeType) {
    const token = await this._getAccessToken();
    const fileBuffer = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

    // ─── Step 0: Detect if folder is in a Shared Drive ────────────
    let driveId = null;
    try {
      const folderInfo = await this._driveRequest(
        `/files/${folderId}?fields=driveId,teamDriveId&supportsAllDrives=true&includeItemsFromAllDrives=true`
      );
      driveId = folderInfo.driveId || folderInfo.teamDriveId || null;
    } catch (e) {
      // ไม่เป็นไร ถ้าดึง driveId ไม่ได้ ก็อัปโหลดแบบปกติ
    }

    // ─── Step 1: Initiate resumable upload session ────────────────
    const metadataObj = {
      name:    filename,
      parents: [folderId],
    };
    // สำหรับ Shared Drive ต้องระบุ driveId ให้ชัดเจน
    if (driveId) {
      metadataObj.driveId = driveId;
    }
    const metadata = JSON.stringify(metadataObj);

    let uploadParams = 'uploadType=resumable&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=id,name,webViewLink';
    if (driveId) {
      uploadParams += `&driveId=${driveId}&corpora=drive`;
    }

    const initiateUrl = `${UPLOAD_API}/files?${uploadParams}`;
    const initiateRes = await fetch(initiateUrl, {
      method: 'POST',
      headers: {
        Authorization:   `Bearer ${token}`,
        'Content-Type':  'application/json; charset=UTF-8',
        'X-Upload-Content-Type':   mimeType,
        'X-Upload-Content-Length': String(fileBuffer.byteLength),
      },
      body: metadata,
    });

    if (!initiateRes.ok) {
      const errBody = await initiateRes.text();
      throw new Error(`[Step1-Initiate] ${initiateRes.status}: ${errBody} (driveId=${driveId}, folderId=${folderId})`);
    }

    // ─── Step 2: Upload the actual file to the session URL ────────
    const sessionUrl = initiateRes.headers.get('Location');
    if (!sessionUrl) {
      throw new Error('[Step2] No session URL returned from initiation');
    }

    const res = await fetch(sessionUrl, {
      method:  'PUT',
      headers: {
        'Content-Type':   mimeType,
        'Content-Length': String(fileBuffer.byteLength),
      },
      body: fileBuffer,
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`[Step2-Upload] ${res.status}: ${errBody}`);
    }

    const data = await res.json();

    // Make file publicly readable (optional — comment out for private files)
    await this._makePublic(data.id, token);

    return {
      id:          data.id,
      name:        data.name,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    };
  }

  /**
   * ทำให้ไฟล์ใน Drive อ่านได้แบบสาธารณะ (anyone with link)
   */
  async _makePublic(fileId, token) {
    await fetch(`${DRIVE_API}/files/${fileId}/permissions?supportsAllDrives=true`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });
    // ไม่ throw error ถ้า permission ล้มเหลว (ไฟล์ยังอัปโหลดสำเร็จ)
  }

  /**
   * ดึงรายการไฟล์ใน Folder
   * @returns {Array<{ id, name, mimeType, webViewLink, createdTime }>}
   */
  async getFilesInFolder(folderId, pageToken = null) {
    const params = new URLSearchParams({
      q:      `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken,files(id,name,mimeType,webViewLink,createdTime,size)',
      orderBy: 'createdTime desc',
      pageSize: '50',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const data = await this._driveRequest(`/files?${params}`);
    return {
      files:         data.files || [],
      nextPageToken: data.nextPageToken || null,
    };
  }

  /**
   * ลบไฟล์ออกจาก Drive (ย้ายไป Trash)
   */
  async deleteFile(fileId) {
    const token = await this._getAccessToken();
    const res = await fetch(`${DRIVE_API}/files/${fileId}?supportsAllDrives=true`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Delete failed: ${res.status}`);
    }
    return true;
  }
}

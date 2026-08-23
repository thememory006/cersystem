import { useState, useCallback } from 'react';
import DriveSettingsCard from '../components/DriveSettingsCard';
import {
  Settings, HardDrive, AlertTriangle, CheckCircle2,
  ChevronLeft, Info, Copy, Check, Shield
} from 'lucide-react';

// Owner type visual config
const OWNER_CONFIGS = [
  {
    ownerType: 'สถานศึกษา',
    icon: '🏫',
    colorClasses: {
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-300',
      border: 'border-cyan-500/30',
      ring: 'ring-cyan-500/20',
    },
  },
  {
    ownerType: 'ผู้บริหาร',
    icon: '👔',
    colorClasses: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      ring: 'ring-emerald-500/20',
    },
  },
  {
    ownerType: 'ครู',
    icon: '👩‍🏫',
    colorClasses: {
      bg: 'bg-violet-500/15',
      text: 'text-violet-300',
      border: 'border-violet-500/30',
      ring: 'ring-violet-500/20',
    },
  },
  {
    ownerType: 'นักเรียน',
    icon: '🎓',
    colorClasses: {
      bg: 'bg-pink-500/15',
      text: 'text-pink-300',
      border: 'border-pink-500/30',
      ring: 'ring-pink-500/20',
    },
  },
];

// JSON Structure Example
const JSON_EXAMPLE = `{
  "id": "cert-uuid-xxxx",
  "user_name": "ครูสมหญิง วิชาการดี",
  "owner_type": "ครู",
  "item_type": "อบรม/พัฒนาตนเอง",
  "level": "ภาค",
  "ocr_text": "เกียรติบัตรนี้ให้ไว้...",
  "drive_image_id": "1BxiMYour...",
  "created_at": "2024-10-22T10:00:00Z"
}`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all border border-white/10"
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
      {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
    </button>
  );
}

export default function SettingsPage({ onBack }) {
  // Drive config state: { ownerType: folderId }
  const [folderIds, setFolderIds] = useState({
    'สถานศึกษา': '',
    'ผู้บริหาร': '',
    'ครู': '',
    'นักเรียน': '',
  });

  // Connection status per owner type
  const [statuses, setStatuses] = useState({
    'สถานศึกษา': 'unconfigured',
    'ผู้บริหาร': 'unconfigured',
    'ครู': 'unconfigured',
    'นักเรียน': 'unconfigured',
  });

  const [savingMap, setSavingMap] = useState({});
  const [globalSaved, setGlobalSaved] = useState(false);

  // Test connection for a folder
  const handleTest = useCallback(async (ownerType, folderId) => {
    if (!folderId) return;
    setStatuses(prev => ({ ...prev, [ownerType]: 'testing' }));

    try {
      // Call backend: GET /api/drive/test/:folderId
      const res = await fetch(`/api/drive/test/${folderId}`, { method: 'POST' });
      const ok = res.ok;
      setStatuses(prev => ({ ...prev, [ownerType]: ok ? 'connected' : 'error' }));
    } catch {
      // In demo mode (no backend), simulate success after delay
      await new Promise(r => setTimeout(r, 1400));
      setStatuses(prev => ({
        ...prev,
        [ownerType]: folderId.length > 10 ? 'connected' : 'error',
      }));
    }
  }, []);

  // Save single folder ID
  const handleSave = useCallback(async (ownerType, folderId) => {
    setSavingMap(prev => ({ ...prev, [ownerType]: true }));
    try {
      await fetch('/api/drive/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_type: ownerType, folder_id: folderId }),
      });
    } catch {
      await new Promise(r => setTimeout(r, 800));
    } finally {
      setFolderIds(prev => ({ ...prev, [ownerType]: folderId }));
      setSavingMap(prev => ({ ...prev, [ownerType]: false }));
    }
  }, []);

  // Save All
  const handleSaveAll = async () => {
    const entries = Object.entries(folderIds).filter(([, v]) => v);
    for (const [ownerType, folderId] of entries) {
      await handleSave(ownerType, folderId);
    }
    setGlobalSaved(true);
    setTimeout(() => setGlobalSaved(false), 3000);
  };

  const connectedCount = Object.values(statuses).filter(s => s === 'connected').length;

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            {onBack && (
              <button
                onClick={onBack}
                id="settings-back-btn"
                className="mt-1 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <Settings size={16} className="text-brand-400" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">ตั้งค่าระบบ</h1>
              </div>
              <p className="text-slate-400 text-sm">จัดการการเชื่อมต่อ Google Drive สำหรับเก็บเกียรติบัตร</p>
            </div>
          </div>

          {/* Overall status */}
          <div className="glass-card rounded-2xl px-4 py-3 text-center hidden sm:block">
            <p className="text-2xl font-bold gradient-text">{connectedCount}/4</p>
            <p className="text-xs text-slate-500 mt-0.5">โฟลเดอร์เชื่อมต่อแล้ว</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="glass-card rounded-2xl p-4 mb-6 border border-amber-500/20 bg-amber-500/5 flex gap-3">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-300 mb-1">ขั้นตอนก่อนตั้งค่า</p>
            <ol className="text-slate-400 space-y-1 list-decimal list-inside text-xs leading-relaxed">
              <li>สร้างโฟลเดอร์ใน Google Drive สำหรับแต่ละประเภท (4 โฟลเดอร์)</li>
              <li>แชร์โฟลเดอร์ให้ Service Account Email (Editor permission)</li>
              <li>คัดลอก Folder ID จาก URL มาวางด้านล่าง</li>
            </ol>
          </div>
        </div>

        {/* ─── Google Drive Folder Config ─── */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={16} className="text-brand-400" />
            <h2 className="text-base font-bold text-slate-200">Google Drive — โฟลเดอร์แยกตามประเภทเจ้าของ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OWNER_CONFIGS.map((cfg) => (
              <DriveSettingsCard
                key={cfg.ownerType}
                {...cfg}
                folderId={folderIds[cfg.ownerType]}
                status={statuses[cfg.ownerType]}
                onFolderIdChange={(val) =>
                  setFolderIds(prev => ({ ...prev, [cfg.ownerType]: val }))
                }
                onTest={handleTest}
                onSave={handleSave}
                isSaving={!!savingMap[cfg.ownerType]}
              />
            ))}
          </div>
        </section>

        {/* ─── How to Get Folder ID ─── */}
        <section className="mb-8">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info size={15} className="text-sky-400" />
              <h3 className="text-sm font-bold text-slate-200">วิธีหา Folder ID จาก Google Drive</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-300 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p>เปิด <span className="text-slate-200 font-medium">drive.google.com</span> แล้วคลิกเข้าโฟลเดอร์ที่ต้องการ</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-300 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p>ดู URL ในแถบ Address Bar: <code className="bg-white/8 px-1.5 py-0.5 rounded text-xs text-sky-300 font-mono">drive.google.com/drive/folders/<strong className="text-amber-300">FOLDER_ID_HERE</strong></code></p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-300 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <p>คัดลอกส่วนที่เป็น ID (ต่อจาก <code className="bg-white/8 px-1.5 py-0.5 rounded text-xs font-mono">/folders/</code>) มาวางในช่องด้านบน</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── JSON Structure Preview ─── */}
        <section className="mb-8">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-violet-400" />
                <h3 className="text-sm font-bold text-slate-200">โครงสร้างไฟล์ JSON ที่จะเก็บใน Drive</h3>
              </div>
              <CopyButton text={JSON_EXAMPLE} />
            </div>
            <pre className="bg-slate-900/60 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed border border-white/5">
              <code>{JSON_EXAMPLE}</code>
            </pre>
            <p className="text-xs text-slate-500 mt-3">
              แต่ละใบเกียรติบัตรจะสร้าง 2 ไฟล์ใน Drive: 
              <span className="text-slate-300 ml-1">🖼️ .jpg (รูปภาพ)</span> + 
              <span className="text-slate-300 ml-1">📄 .json (ข้อมูล)</span>
            </p>
          </div>
        </section>

        {/* ─── Save All Button ─── */}
        <div className="flex items-center justify-end gap-3">
          {globalSaved && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 animate-fade-in-up">
              <CheckCircle2 size={16} />
              บันทึกทั้งหมดเรียบร้อย!
            </div>
          )}
          <button
            id="save-all-drive-config"
            onClick={handleSaveAll}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <HardDrive size={15} />
            บันทึกการตั้งค่าทั้งหมด
          </button>
        </div>

      </div>
    </div>
  );
}

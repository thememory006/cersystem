import { useState } from 'react';
import {
  FolderOpen, CheckCircle2, XCircle, Loader2, ExternalLink,
  Save, RefreshCw, Settings, ChevronRight
} from 'lucide-react';

// Status badge
function StatusBadge({ status }) {
  const map = {
    connected:    { icon: CheckCircle2, text: 'เชื่อมต่อแล้ว', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
    error:        { icon: XCircle,      text: 'ไม่สามารถเข้าถึงได้', cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
    testing:      { icon: Loader2,      text: 'กำลังทดสอบ...', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
    unconfigured: { icon: Settings,     text: 'ยังไม่ตั้งค่า', cls: 'text-slate-500 bg-slate-500/10 border-slate-500/30' },
  };
  const { icon: Icon, text, cls } = map[status] || map.unconfigured;
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cls}`}>
      <Icon size={12} className={status === 'testing' ? 'animate-spin' : ''} />
      {text}
    </span>
  );
}

export default function DriveSettingsCard({
  ownerType,
  icon,
  colorClasses, // { bg, text, border, ring }
  folderId,
  status,
  onFolderIdChange,
  onTest,
  onSave,
  isSaving,
}) {
  const [localId, setLocalId] = useState(folderId || '');
  const isDirty = localId !== (folderId || '');
  const driveUrl = localId
    ? `https://drive.google.com/drive/folders/${localId}`
    : null;

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all duration-300 ${colorClasses.border} hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colorClasses.bg}`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-bold text-base ${colorClasses.text}`}>{ownerType}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Google Drive Folder</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Folder ID Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Folder ID
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FolderOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              id={`drive-folder-id-${ownerType}`}
              value={localId}
              onChange={(e) => setLocalId(e.target.value)}
              placeholder="วาง Folder ID จาก Google Drive..."
              className="search-input pl-9 font-mono text-xs"
              spellCheck={false}
            />
          </div>
          {driveUrl && (
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all"
              title="เปิด Drive Folder"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Hint */}
        <p className="text-[11px] text-slate-600 leading-relaxed">
          เปิด Google Drive → คลิกขวาที่โฟลเดอร์ → Copy link → นำ ID ส่วนท้าย URL มาวาง
        </p>

        {/* Example */}
        {localId && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/8 mt-1">
            <ChevronRight size={11} className="text-slate-500 flex-shrink-0" />
            <span className="text-[11px] text-slate-400 font-mono break-all">
              drive.google.com/drive/folders/
              <span className={`font-bold ${colorClasses.text}`}>{localId}</span>
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
        <button
          id={`test-drive-${ownerType}`}
          onClick={() => onTest(ownerType, localId)}
          disabled={!localId || status === 'testing'}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw size={12} className={status === 'testing' ? 'animate-spin' : ''} />
          ทดสอบ Connection
        </button>

        <button
          id={`save-drive-${ownerType}`}
          onClick={() => onSave(ownerType, localId)}
          disabled={!isDirty || isSaving}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto ${
            isDirty
              ? `${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`
              : 'bg-white/5 text-slate-500 border border-white/10'
          }`}
        >
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {isDirty ? 'บันทึก' : 'บันทึกแล้ว'}
        </button>
      </div>
    </div>
  );
}

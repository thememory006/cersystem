import { useState } from 'react';
import { FolderHeart, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';

export default function DriveSettingsCard({ config }) {
  const [folderId, setFolderId] = useState(config.folderId);
  const [isTesting, setIsTesting] = useState(false);
  
  const typeConfig = TAG_CONFIG.owner_type[config.type] || TAG_CONFIG.owner_type["นักเรียน"];

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'connected':
        return <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle2 size={14} /> เชื่อมต่อแล้ว</div>;
      case 'error':
        return <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><XCircle size={14} /> หาไม่พบ/ไม่มีสิทธิ์</div>;
      case 'not_configured':
      default:
        return <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold border border-slate-200"><AlertCircle size={14} /> ยังไม่ได้ตั้งค่า</div>;
    }
  };

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => setIsTesting(false), 1500); // Simulate API call
  };

  return (
    <div className="glass-card bg-white p-5 rounded-3xl border-4 border-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-4 border-white shadow-sm ${typeConfig.bg}`}>
            {typeConfig.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-base mb-1">
              แฟ้มของ <span className={typeConfig.text}>{config.type}</span>
            </h3>
            {getStatusDisplay(config.status)}
          </div>
        </div>

        {/* Right: Input & Action */}
        <div className="flex-1 max-w-md flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <FolderHeart className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 w-5 h-5" />
            <input 
              type="text" 
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              placeholder="วาง Google Drive Folder ID ที่นี่..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-slate-600 focus:border-pink-300 focus:bg-white outline-none transition-all shadow-inner"
            />
          </div>
          
          <button 
            onClick={handleTest}
            disabled={!folderId || isTesting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-blue-200"
          >
            {isTesting ? <RefreshCw className="animate-spin w-4 h-4" /> : 'ทดสอบ'}
          </button>
        </div>

      </div>
    </div>
  );
}

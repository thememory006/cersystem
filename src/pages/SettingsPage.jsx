import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import DriveSettingsCard from '../components/DriveSettingsCard';

export default function SettingsPage({ onBack }) {
  // Mock data for Drive Folder IDs
  const driveConfigs = [
    { type: 'สถานศึกษา', folderId: '1A_xyz...', status: 'connected' },
    { type: 'ผู้บริหาร', folderId: '', status: 'not_configured' },
    { type: 'ครู', folderId: '1B_abc...', status: 'error' },
    { type: 'นักเรียน', folderId: '', status: 'not_configured' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-700 dark:text-white flex items-center gap-2 mb-2">
          ⚙️ ตั้งค่าระบบโรงเรียน
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">จัดการโฟลเดอร์ Google Drive สำหรับเก็บเกียรติบัตร</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-blue-50/50 border-2 border-blue-100 rounded-3xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 font-medium">
                <p className="font-bold text-blue-700 mb-1">คำแนะนำการตั้งค่า:</p>
                <p>1. สร้างโฟลเดอร์ใน Google Drive ของโรงเรียน</p>
                <p>2. แชร์โฟลเดอร์ให้ Service Account email</p>
                <p>3. นำ Folder ID จาก URL มาใส่ในช่องด้านล่าง</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {driveConfigs.map((config) => (
              <DriveSettingsCard key={config.type} config={config} />
            ))}
          </div>

          {/* Save All Button */}
          <div className="pt-6 border-t-2 border-dashed border-slate-200 flex justify-end">
            <button className="btn-primary flex items-center gap-2 px-8 py-3 text-lg">
              <Save size={20} />
              บันทึกการตั้งค่าทั้งหมด
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border-4 border-white shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              🤖 สถานะ Backend
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Cloudflare Worker</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">D1 Database</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Google Drive API</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Checking...</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-4 border-white shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              📄 ตัวอย่าง JSON Metadata
            </h3>
            <div className="bg-slate-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-[10px] text-green-400 font-mono">
{`{
  "id": "uuid-1234",
  "owner_type": "นักเรียน",
  "item_type": "รางวัล/การแข่งขัน",
  "level": "ประเทศ",
  "drive_image_id": "1A_...",
  "created_at": "2024-10-22T..."
}`}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

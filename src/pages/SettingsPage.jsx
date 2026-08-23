import { useState } from 'react';
import { Type, Users, Database, ShieldCheck, Check, Search } from 'lucide-react';
import DriveSettingsCard from '../components/DriveSettingsCard';
import { useFont, FONT_OPTIONS } from '../context/FontContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { font, setFont } = useFont();

  // Mock data for Drive Folder IDs
  const driveConfigs = [
    { type: 'สถานศึกษา', name: 'โฟลเดอร์สำหรับผู้บริหาร / สถานศึกษา', currentId: '1A2b3C4d5E6f7G8h9I0j' },
    { type: 'ผู้บริหาร', name: 'โฟลเดอร์สำหรับผู้บริหาร', currentId: '0J9i8H7g6F5e4D3c2B1a' },
    { type: 'ครูผู้สอน', name: 'โฟลเดอร์สำหรับครูผู้สอน', currentId: '2X3y4Z5w6V7u8T9s0R' },
    { type: 'นักเรียน', name: 'โฟลเดอร์สำหรับนักเรียน', currentId: 'aB1cD2eF3gH4iJ5kL6' },
  ];

  // Mock member data
  const mockMembers = [
    { id: 1, name: 'สมชาย รักเรียน', email: 'somchai@example.com', role: 'user', status: 'approved' },
    { id: 2, name: 'ครูใจดี มีเมตตา', email: 'kru.jaidee@example.com', role: 'user', status: 'pending' },
    { id: 3, name: 'thememory', email: 'thememory006@gmail.com', role: 'admin', status: 'approved' },
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 border-2 border-white dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <Type size={20} className="text-pink-500" />
          รูปแบบฟอนต์ (Font Family)
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          เลือกฟอนต์ที่ต้องการให้แสดงผลทั่วทั้งเว็บไซต์
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFont(f.id)}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                font === f.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-slate-800 dark:border-pink-500'
                  : 'border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-slate-600 bg-white dark:bg-slate-900/50'
              }`}
              style={{ fontFamily: f.value }}
            >
              <span className="block text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">{f.label}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">ตัวอย่างข้อความ Test</span>
              {font === f.id && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-pink-400">
                  <Check size={14} /> ใช้งานอยู่
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDriveTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="text-yellow-500 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>พื้นที่จัดเก็บแยกตามประเภท:</strong> ระบบจะอัปโหลดและดึงรูปเกียรติบัตรจากโฟลเดอร์ที่คุณกำหนดไว้ 
          กรุณาตรวจสอบว่าโฟลเดอร์ปลายทางได้เปิดสิทธิ์ "แชร์สาธารณะ (Anyone with the link)" เรียบร้อยแล้ว
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {driveConfigs.map((config, index) => (
          <DriveSettingsCard key={index} config={config} />
        ))}
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 border-2 border-white dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users size={20} className="text-pink-500" />
            รายชื่อสมาชิก
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาสมาชิก..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-bold">ชื่อ-นามสกุล</th>
                <th className="pb-3 font-bold">อีเมล</th>
                <th className="pb-3 font-bold">บทบาท</th>
                <th className="pb-3 font-bold">สถานะ</th>
                <th className="pb-3 font-bold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {mockMembers.map(member => (
                <tr key={member.id} className="text-sm">
                  <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">{member.name}</td>
                  <td className="py-4 text-slate-500 dark:text-slate-400">{member.email}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      member.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {member.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4">
                    {member.status === 'approved' ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-bold text-xs"><Check size={14}/> อนุมัติแล้ว</span>
                    ) : (
                      <span className="text-orange-500 dark:text-orange-400 font-bold text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> รอยืนยัน
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    {member.status === 'pending' && (
                      <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm">
                        อนุมัติ
                      </button>
                    )}
                    {member.status === 'approved' && member.role !== 'admin' && (
                      <button className="text-xs border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors font-bold ml-2">
                        แก้ไข
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3 mb-2">
          ⚙️ ตั้งค่าระบบ
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          จัดการการแสดงผล โฟลเดอร์เก็บข้อมูล และผู้ใช้งานในระบบ
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 bg-white dark:bg-slate-900 p-1 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'general' 
              ? 'bg-blue-50 text-blue-700 dark:bg-pink-500/20 dark:text-pink-400' 
              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Type size={18} /> ทั่วไป
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'drive' 
              ? 'bg-blue-50 text-blue-700 dark:bg-pink-500/20 dark:text-pink-400' 
              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Database size={18} /> พื้นที่จัดเก็บ (Drive)
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'members' 
              ? 'bg-blue-50 text-blue-700 dark:bg-pink-500/20 dark:text-pink-400' 
              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Users size={18} /> สมาชิก
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in-up">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'drive' && renderDriveTab()}
        {activeTab === 'members' && renderMembersTab()}
      </div>

    </div>
  );
}

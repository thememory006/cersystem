import { useState, useEffect } from 'react';
import { Type, Users, Database, ShieldCheck, Check, Search, Settings, Image as ImageIcon, Save, Trash2, ShieldAlert, ShieldOff } from 'lucide-react';
import DriveSettingsCard from '../components/DriveSettingsCard';
import { useFont, FONT_OPTIONS } from '../context/FontContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { confirmAction } from '../utils/alert';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { font, setFont } = useFont();
  const { logoUrl, updateLogoUrl } = useSettings();
  const { user } = useAuth();
  const [inputLogoUrl, setInputLogoUrl] = useState('');

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (logoUrl) setInputLogoUrl(logoUrl);
  }, [logoUrl]);

  // Fetch all users from backend
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/users`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error('ไม่สามารถโหลดรายชื่อสมาชิกได้');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'members') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleChangeRole = async (userId, newRole) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`เปลี่ยนสิทธิ์เรียบร้อยแล้ว`);
        fetchUsers();
      } else {
        toast.error('ไม่สามารถเปลี่ยนสิทธิ์ได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    // ไม่อนุญาตลบตัวเอง
    if (userId === user?.uid) {
      toast.error('ไม่สามารถลบบัญชีของตัวเองได้');
      return;
    }
    const confirmed = await confirmAction(
      `ลบผู้ใช้ "${userName}"?`,
      'การกระทำนี้ไม่สามารถกู้คืนได้',
      'ลบผู้ใช้',
      true
    );
    if (!confirmed) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('ลบผู้ใช้เรียบร้อยแล้ว');
        fetchUsers();
      } else {
        toast.error('ไม่สามารถลบผู้ใช้ได้');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  // Mock data for Drive Folder IDs
  const driveConfigs = [
    { type: 'สถานศึกษา', name: 'โฟลเดอร์สำหรับผู้บริหาร / สถานศึกษา', currentId: '' },
    { type: 'ผู้บริหาร', name: 'โฟลเดอร์สำหรับผู้บริหาร', currentId: '' },
    { type: 'ครูผู้สอน', name: 'โฟลเดอร์สำหรับครูผู้สอน', currentId: '' },
    { type: 'นักเรียน', name: 'โฟลเดอร์สำหรับนักเรียน', currentId: '' },
  ];

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      
      {/* Logo URL Settings */}
      <div className="glass-card p-6 border-2 border-white dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <ImageIcon size={20} className="text-blue-500" />
          โลโก้สถานศึกษา (Logo URL)
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          ระบุ URL ของรูปภาพโลโก้ที่จะแสดงบนแท็บนำทาง (Navbar) — รองรับ URL รูปภาพโดยตรงเท่านั้น
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-blue-100 dark:border-slate-600 overflow-hidden shrink-0">
            <img 
              src={inputLogoUrl || '/logo.png'} 
              alt="Preview Logo" 
              className="w-full h-full object-contain p-1" 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Logo&background=1d4ed8&color=fff"; }} 
            />
          </div>
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              value={inputLogoUrl}
              onChange={(e) => setInputLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png" 
              className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-mono"
            />
          </div>
          <button 
            onClick={async () => {
              await updateLogoUrl(inputLogoUrl);
              toast.success('อัปเดตโลโก้เรียบร้อยแล้ว ✅');
            }}
            className="btn-primary py-2.5 px-6 flex items-center gap-2 whitespace-nowrap"
          >
            <Save size={18} /> บันทึกโลโก้
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          💡 หากใช้ Google Drive: ให้เปิดไฟล์รูป → แชร์ → "ทุกคนที่มีลิงก์" → แล้วแปลง URL เป็น <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">https://drive.google.com/uc?export=view&id=FILE_ID</code>
        </p>
      </div>

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
            รายชื่อสมาชิก ({users.length} คน)
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาสมาชิก..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-400">
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-bold">สมาชิก</th>
                  <th className="pb-3 font-bold">อีเมล</th>
                  <th className="pb-3 font-bold">บทบาท</th>
                  <th className="pb-3 font-bold">เข้าใช้ล่าสุด</th>
                  <th className="pb-3 font-bold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {users.length === 0 ? 'ยังไม่มีสมาชิกในระบบ' : 'ไม่พบสมาชิกที่ค้นหา'}
                    </td>
                  </tr>
                ) : filteredUsers.map(member => (
                  <tr key={member.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}&background=1d4ed8&color=fff`}
                          alt={member.name}
                          className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-600"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=U&background=475569&color=fff`; }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{member.name || '(ไม่ระบุชื่อ)'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">{member.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        member.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {member.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 dark:text-slate-500 text-xs">
                      {member.last_login ? new Date(member.last_login).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* ไม่แสดงปุ่มจัดการตัวเอง */}
                        {member.id !== user?.uid && (
                          <>
                            {member.role === 'user' ? (
                              <button
                                onClick={() => handleChangeRole(member.id, 'admin')}
                                title="เลื่อนเป็น Admin"
                                className="p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              >
                                <ShieldAlert size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleChangeRole(member.id, 'user')}
                                title="ลดเป็น User"
                                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                <ShieldOff size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(member.id, member.name)}
                              title="ลบผู้ใช้"
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {member.id === user?.uid && (
                          <span className="text-xs text-slate-400 italic">บัญชีของคุณ</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3 mb-2">
          <Settings size={32} className="text-slate-700 dark:text-slate-300" /> ตั้งค่าระบบ
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

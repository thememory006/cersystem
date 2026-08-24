import { useState } from 'react';
import { X, Save, User, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';

export default function ProfileModal({ onClose }) {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('กรุณาระบุชื่อ-นามสกุล');
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading('กำลังบันทึกข้อมูล...');

    try {
      // 1. Update Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name,
          photoURL: formData.avatar
        });
      }

      // 2. Update Backend D1 (users table)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.uid,
          email: user.email,
          name: formData.name,
          avatar_url: formData.avatar
        })
      });

      const data = await res.json();
      if (data.success) {
        // Update local context
        setUser({
          ...user,
          name: formData.name,
          avatar: formData.avatar
        });
        toast.success('อัปเดตโปรไฟล์สำเร็จ', { id: loadingToast });
        onClose();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาด: ' + err.message, { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-scale-up">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="text-blue-500" size={24} /> แก้ไขโปรไฟล์
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          
          <div className="flex justify-center mb-2">
            <img 
              src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'U')}&background=1d4ed8&color=fff`} 
              alt="Avatar Preview" 
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'U')}&background=1d4ed8&color=fff`; }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ชื่อ - นามสกุล</label>
            <div className="relative">
              <input
                type="text"
                placeholder="ระบุชื่อจริง นามสกุลจริง"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">ชื่อนี้จะถูกแสดงเป็นเจ้าของผลงานเมื่อคุณอัปโหลด</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ลิงก์รูปโปรไฟล์ (URL)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://..."
                value={formData.avatar}
                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
              />
              <ImageIcon size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] px-5 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save size={18} /> บันทึก
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, Save, FileText, Settings, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function EditModal({ cert, onClose, onUpdate }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    owner_type: cert.owner_type || 'นักเรียน',
    item_type: cert.item_type || 'รางวัล/การแข่งขัน',
    level: cert.level || 'สถานศึกษา',
    ocr_text: cert.ocr_text || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading('กำลังบันทึกการแก้ไข...');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/certificates/${cert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          owner_type: formData.owner_type,
          item_type: formData.item_type,
          level: formData.level,
          ocr_text: formData.ocr_text
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('บันทึกการแก้ไขเรียบร้อยแล้ว', { id: loadingToast });
        onUpdate(formData);
      } else {
        toast.error(data.error || 'ไม่สามารถบันทึกข้อมูลได้', { id: loadingToast });
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="text-blue-500" size={24} /> แก้ไขรายละเอียด
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
          {/* Owner Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">บทบาท / เจ้าของผลงาน</label>
            <select
              value={formData.owner_type}
              onChange={e => setFormData({ ...formData, owner_type: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            >
              <option value="สถานศึกษา">🏫 สถานศึกษา</option>
              <option value="ผู้บริหาร">👨‍💼 ผู้บริหาร</option>
              <option value="ครู">👩‍🏫 ครู</option>
              <option value="นักเรียน">🎓 นักเรียน</option>
            </select>
          </div>

          {/* Item Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ประเภทเกียรติบัตร</label>
            <select
              value={formData.item_type}
              onChange={e => setFormData({ ...formData, item_type: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            >
              <option value="รางวัล/การแข่งขัน">🏆 รางวัล / การแข่งขัน</option>
              <option value="วิทยากร/คณะทำงาน">🎤 วิทยากร / คณะทำงาน</option>
              <option value="เข้าร่วมกิจกรรม/อบรม">📝 เข้าร่วมกิจกรรม / อบรม</option>
              <option value="ผลงานอื่นๆ">✨ ผลงานอื่นๆ</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ระดับของผลงาน</label>
            <select
              value={formData.level}
              onChange={e => setFormData({ ...formData, level: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            >
              <option value="สถานศึกษา">🏫 ระดับสถานศึกษา</option>
              <option value="เขตพื้นที่/จังหวัด">📍 ระดับเขตพื้นที่ / จังหวัด</option>
              <option value="ภูมิภาค">🗺️ ระดับภูมิภาค</option>
              <option value="ชาติ">🇹🇭 ระดับชาติ</option>
              <option value="นานาชาติ">🌍 ระดับนานาชาติ</option>
            </select>
          </div>

          {/* OCR Text / Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              ข้อความในเกียรติบัตร
            </label>
            <textarea
              rows="4"
              placeholder="ข้อความหรือรายละเอียดในเกียรติบัตร..."
              value={formData.ocr_text}
              onChange={e => setFormData({ ...formData, ocr_text: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none"
            />
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
                  <Save size={18} /> บันทึกการแก้ไข
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

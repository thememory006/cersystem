import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function UploadModal({ onClose, onUploadSuccess }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    owner_type: 'นักเรียน',
    item_type: 'รางวัล/การแข่งขัน',
    level: 'สถานศึกษา',
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('กรุณาเลือกรูปภาพเกียรติบัตร');
      return;
    }

    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนอัปโหลด');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('image', file);
      data.append('owner_type', formData.owner_type);
      data.append('item_type', formData.item_type);
      data.append('level', formData.level);
      data.append('user_name', user.name);
      data.append('user_id', user.uid);
      data.append('ocr_text', 'OCR Processing (Mock)');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/drive/upload`, {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      
      if (result.success) {
        toast.success('อัปโหลดผลงานสำเร็จ!');
        if (onUploadSuccess) onUploadSuccess(result.data);
        onClose();
      } else {
        toast.error('เกิดข้อผิดพลาด: ' + (result.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Upload className="text-blue-500" size={24} />
            เพิ่มผลงานใหม่
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-full shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
          
          {/* Image Upload Area */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div 
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all min-h-[250px] relative overflow-hidden group ${
                file 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2">
                      <ImageIcon size={18} /> เปลี่ยนรูปภาพ
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 dark:bg-slate-800 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    คลิกเพื่อเลือกไฟล์รูปภาพ
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    รองรับ JPG, PNG, WEBP (สูงสุด 5MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="w-full md:w-1/2 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                ผู้รับผลงาน (Owner Type)
              </label>
              <select 
                value={formData.owner_type}
                onChange={(e) => setFormData({...formData, owner_type: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                {Object.keys(TAG_CONFIG.owner_type).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                ประเภทผลงาน (Item Type)
              </label>
              <select 
                value={formData.item_type}
                onChange={(e) => setFormData({...formData, item_type: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                {Object.keys(TAG_CONFIG.item_type).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                ระดับผลงาน (Level)
              </label>
              <select 
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                {Object.keys(TAG_CONFIG.level).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleUpload}
            disabled={loading || !file}
            className="btn-primary py-2.5 px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> กำลังอัปโหลด...</>
            ) : (
              <><CheckCircle size={18} /> ยืนยันการอัปโหลด</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

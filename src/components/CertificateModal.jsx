import { X, ExternalLink, Calendar, User, Tag, Download } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';
import { useEffect } from 'react';

export default function CertificateModal({ cert, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!cert) return null;

  const ownerConfig = TAG_CONFIG.owner_type[cert.owner_type] || TAG_CONFIG.owner_type["นักเรียน"];
  const itemConfig = TAG_CONFIG.item_type[cert.item_type] || TAG_CONFIG.item_type["รางวัล"];
  const levelConfig = TAG_CONFIG.level[cert.level] || TAG_CONFIG.level["ระดับโรงเรียน"];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto animate-fade-in-up">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="min-h-screen px-4 py-8 flex items-center justify-center pointer-events-none">
        
        {/* Modal Content */}
        <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border-4 border-white dark:border-slate-800 pointer-events-auto">
        
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-md"
          >
            <X size={24} />
          </button>

          {/* Image Section */}
          <div className="w-full md:w-3/5 bg-slate-100 dark:bg-black flex items-center justify-center p-4 md:p-8 overflow-hidden relative group">
            <img 
              src={cert.image_url} 
              alt={cert.title || 'Certificate'} 
              className="max-w-full max-h-[40vh] md:max-h-[80vh] object-contain rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {cert.drive_link && (
              <a 
                href={cert.drive_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-800 dark:text-white rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <Download size={16} /> ดูไฟล์ต้นฉบับ
              </a>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-2/5 p-6 md:p-8 overflow-y-auto bg-blue-50/30 dark:bg-slate-900 flex flex-col">
            <div className="flex-1">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`tag ${ownerConfig.bg} ${ownerConfig.text} ${ownerConfig.border}`}>
                  {ownerConfig.icon} {cert.owner_type}
                </span>
                <span className={`tag ${itemConfig.bg} ${itemConfig.text} ${itemConfig.border}`}>
                  {itemConfig.icon} {cert.item_type}
                </span>
                <span className={`tag ${levelConfig.bg} ${levelConfig.text} ${levelConfig.border}`}>
                  {levelConfig.icon} {cert.level}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-4 leading-tight">
                {cert.title}
              </h2>
              
              {cert.description && (
                <p className="text-slate-600 dark:text-slate-300 text-base mb-8 leading-relaxed font-medium">
                  {cert.description}
                </p>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-blue-100 dark:bg-slate-800 rounded-xl text-blue-600 dark:text-blue-400">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">เจ้าของผลงาน</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{cert.owner_name || 'ไม่ระบุชื่อ'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="p-2 bg-pink-100 dark:bg-slate-800 rounded-xl text-pink-600 dark:text-pink-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">วันที่ได้รับ / วันที่กิจกรรม</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{cert.date}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

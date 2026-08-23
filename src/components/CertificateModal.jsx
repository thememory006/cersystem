import { X, Download, User, Calendar, Award, MapPin, Heart } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function CertificateModal({ cert, onClose }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(cert?.likes ?? 0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleLike = (e) => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes(prev => prev + 1);
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x, y },
        colors: ['#ef4444', '#f472b6', '#3b82f6'],
        disableForReducedMotion: true,
        zIndex: 300,
        scalar: 1.2
      });
    } else {
      setIsLiked(false);
      setLikes(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!cert) return null;

  const ownerConfig = TAG_CONFIG.owner_type[cert.owner_type] || TAG_CONFIG.owner_type["นักเรียน"];
  const itemConfig  = TAG_CONFIG.item_type[cert.item_type]   || TAG_CONFIG.item_type["รางวัล/การแข่งขัน"];
  const levelConfig = TAG_CONFIG.level[cert.level]           || TAG_CONFIG.level["สถานศึกษา"];

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">

      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center px-4 pt-20 pb-6 sm:px-6 sm:pt-24">
        <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-1.5 bg-white/80 dark:bg-slate-800/80 text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>

          {/* Image panel */}
          <div className="w-full md:w-[55%] bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden flex-shrink-0 min-h-[200px] md:min-h-[400px]">
            <img
              src={cert.image_url}
              alt={cert.user_name || 'เกียรติบัตร'}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
            {cert.drive_url && (
              <a
                href={cert.drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-slate-800 text-slate-700 dark:text-white rounded-full text-xs font-bold shadow-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={13} /> ดาวน์โหลด / ดูต้นฉบับ
              </a>
            )}
          </div>

          {/* Details panel */}
          <div className="flex flex-col flex-1 overflow-hidden">

            <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4">
              <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-widest mb-1">เกียรติบัตร / ผลงาน</p>
              <h2 className="text-white text-base font-extrabold leading-snug">
                {cert.user_name || 'ผลงาน'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ownerConfig.bg} ${ownerConfig.text} ${ownerConfig.border}`}>
                  {ownerConfig.icon} {cert.owner_type}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${itemConfig.bg} ${itemConfig.text} ${itemConfig.border}`}>
                  {itemConfig.icon} {cert.item_type}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${levelConfig.bg} ${levelConfig.text} ${levelConfig.border}`}>
                  {levelConfig.icon} {cert.level}
                </span>
              </div>

              <div className="space-y-3">
                <InfoRow icon={<User size={16} />} label="เจ้าของผลงาน" value={cert.user_name || '-'} />
                <InfoRow
                  icon={<Calendar size={16} />}
                  label="วันที่บันทึก"
                  value={cert.created_at
                    ? new Date(cert.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '-'}
                />
                <InfoRow icon={<Award size={16} />} label="ประเภท" value={cert.item_type || '-'} />
                <InfoRow icon={<MapPin size={16} />} label="ระดับ" value={cert.level || '-'} />
              </div>

              {cert.ocr_text && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ข้อความในเกียรติบัตร</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">{cert.ocr_text}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                >
                  <Heart size={16} className={isLiked ? "fill-red-500 animate-heart-pop" : ""} />
                  {likes}
                </button>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {cert.views ?? 0}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

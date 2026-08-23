import { useState } from 'react';
import { Heart, MessageCircle, ExternalLink, MoreHorizontal, Eye } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';

export default function CertCard({ cert }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const ownerConfig = TAG_CONFIG.owner_type[cert.owner_type] || TAG_CONFIG.owner_type["นักเรียน"];
  const itemConfig = TAG_CONFIG.item_type[cert.item_type] || TAG_CONFIG.item_type["รางวัล/การแข่งขัน"];
  const levelConfig = TAG_CONFIG.level[cert.level] || TAG_CONFIG.level["สถานศึกษา"];

  return (
    <div 
      className="feed-card group p-5 bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={cert.user_avatar} 
              alt={cert.user_name} 
              className="w-12 h-12 rounded-full border-4 border-pink-100 object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[12px] bg-white shadow-sm`}>
              {ownerConfig.icon}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-sm">{cert.user_name}</h3>
            <p className="text-xs text-slate-400 font-medium">
              {new Date(cert.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button className="text-slate-300 hover:text-pink-400 transition-colors bg-slate-50 p-1 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image / Content */}
      <div className="relative rounded-2xl overflow-hidden bg-blue-50 border-4 border-blue-50 mb-4 group-hover:border-pink-100 transition-colors aspect-[4/3] flex items-center justify-center">
        {/* Loading skeleton */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Actual Image */}
        {!imgError ? (
          <img 
            src={cert.image_url} 
            alt="Certificate" 
            className={`w-full h-full object-cover transform transition-transform duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="text-4xl animate-bounce-slow">🎨</div>
            <p className="text-sm text-slate-500 font-medium">ไม่สามารถโหลดรูปภาพได้</p>
          </div>
        )}

        {/* View full button overlay */}
        {imgLoaded && (
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-pink-500 bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-50 hover:scale-105 transform translate-y-2 group-hover:translate-y-0">
            <Eye size={14} />
            ดูภาพเต็ม
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`tag ${ownerConfig.bg} ${ownerConfig.text} border-2 ${ownerConfig.border}`}>
          {ownerConfig.icon} {cert.owner_type}
        </span>
        <span className={`tag ${itemConfig.bg} ${itemConfig.text} border-2 ${itemConfig.border}`}>
          {itemConfig.icon} {cert.item_type}
        </span>
        <span className={`tag ${levelConfig.bg} ${levelConfig.text} border-2 ${levelConfig.border}`}>
          {levelConfig.icon} {cert.level}
        </span>
      </div>

      {/* OCR Text Snippet */}
      {cert.ocr_text && (
        <div className="mb-4 text-xs text-slate-500 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
          <span className="absolute -top-2 -left-2 text-xl opacity-20">📝</span>
          <span className="pl-4">{cert.ocr_text}</span>
        </div>
      )}

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-blue-100">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-pink-500 transition-colors group/btn">
            <Heart className={`w-6 h-6 transition-transform ${isHovered ? 'scale-110' : ''} group-hover/btn:fill-pink-500`} />
            <span className="text-sm font-bold">{cert.likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Eye className="w-5 h-5" />
            <span className="text-sm font-bold">{cert.views}</span>
          </div>
        </div>
        
        {cert.drive_url && (
          <a 
            href={cert.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-colors"
          >
            เปิดใน Drive <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

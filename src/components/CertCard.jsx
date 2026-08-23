import { useState } from 'react';
import { Heart, MessageCircle, ExternalLink, MoreHorizontal, Eye } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';

export default function CertCard({ cert, style, onClick, viewMode = 'grid' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const ownerConfig = TAG_CONFIG.owner_type[cert.owner_type] || TAG_CONFIG.owner_type["นักเรียน"];
  const itemConfig = TAG_CONFIG.item_type[cert.item_type] || TAG_CONFIG.item_type["รางวัล/การแข่งขัน"];
  const levelConfig = TAG_CONFIG.level[cert.level] || TAG_CONFIG.level["สถานศึกษา"];

  if (viewMode === 'list') {
    return (
      <div 
        className="feed-card group p-4 bg-white dark:bg-slate-800 cursor-pointer border-2 border-white dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center sm:items-stretch"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={style}
        onClick={() => onClick && onClick(cert)}
      >
        {/* Image / Content */}
        <div className="relative rounded-2xl overflow-hidden bg-blue-50 border-4 border-blue-50 group-hover:border-pink-100 transition-colors flex-shrink-0 w-full sm:w-48 h-32 flex items-center justify-center">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
          )}
          {!imgError ? (
            <img 
              src={cert.image_url} 
              alt="Certificate" 
              className={`w-full h-full object-cover transform transition-transform duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-2xl animate-bounce-slow">🎨</div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col flex-1 min-w-0 justify-between w-full">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img src={cert.user_avatar} alt={cert.user_name} className="w-8 h-8 rounded-full border-2 border-pink-100 dark:border-slate-700 object-cover" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white dark:border-slate-800 flex items-center justify-center text-[8px] bg-white dark:bg-slate-700 shadow-sm">
                    {ownerConfig.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{cert.user_name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(cert.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                <span className={`tag !text-[10px] !px-2 !py-0.5 ${ownerConfig.bg} ${ownerConfig.text} border-2 ${ownerConfig.border}`}>{ownerConfig.icon} {cert.owner_type}</span>
                <span className={`tag !text-[10px] !px-2 !py-0.5 ${itemConfig.bg} ${itemConfig.text} border-2 ${itemConfig.border}`}>{itemConfig.icon} {cert.item_type}</span>
              </div>
            </div>
            {cert.ocr_text && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">📝 {cert.ocr_text}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Heart className="w-4 h-4" /> <span className="text-xs font-bold">{cert.likes}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Eye className="w-4 h-4" /> <span className="text-xs font-bold">{cert.views}</span>
              </div>
            </div>
            {cert.drive_url && (
              <a href={cert.drive_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-800 px-2 py-1 rounded-full border border-blue-200 transition-colors flex items-center gap-1" onClick={e => e.stopPropagation()}>
                Drive <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="feed-card group p-3 sm:p-5 bg-white dark:bg-slate-800 cursor-pointer border-2 border-white dark:border-slate-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
      onClick={() => onClick && onClick(cert)}
    >
      {/* Header Info */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <img 
              src={cert.user_avatar} 
              alt={cert.user_name} 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-pink-100 dark:border-slate-700 object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] sm:text-[12px] bg-white dark:bg-slate-700 shadow-sm`}>
              {ownerConfig.icon}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-xs sm:text-sm truncate">{cert.user_name}</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
              {new Date(cert.created_at).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Image / Content */}
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-blue-50 border-2 sm:border-4 border-blue-50 mb-3 sm:mb-4 group-hover:border-pink-100 transition-colors aspect-[4/3] flex items-center justify-center">
        {/* Loading skeleton */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 sm:gap-2">
            <div className="text-2xl sm:text-4xl animate-bounce-slow">🎨</div>
          </div>
        )}

        {/* View full button overlay */}
        {imgLoaded && (
          <button className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-pink-500 bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-50 hover:scale-105 transform translate-y-2 group-hover:translate-y-0">
            <Eye size={12} />
            ดูภาพ
          </button>
        )}
      </div>

      {/* Tags (Hidden on very small screens if too long, or wrapped) */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4 hidden sm:flex">
        <span className={`tag !text-[10px] sm:!text-xs ${ownerConfig.bg} ${ownerConfig.text} border ${ownerConfig.border}`}>
          {ownerConfig.icon} {cert.owner_type}
        </span>
        <span className={`tag !text-[10px] sm:!text-xs ${itemConfig.bg} ${itemConfig.text} border ${itemConfig.border}`}>
          {itemConfig.icon} {cert.item_type}
        </span>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-dashed border-blue-100 dark:border-slate-700">
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="flex items-center gap-1 text-slate-400 hover:text-pink-500 transition-colors group/btn" onClick={e => e.stopPropagation()}>
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isHovered ? 'scale-110' : ''} group-hover/btn:fill-pink-500`} />
            <span className="text-[10px] sm:text-xs font-bold">{cert.likes}</span>
          </button>
          <div className="flex items-center gap-1 text-slate-400">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs font-bold">{cert.views}</span>
          </div>
        </div>
        
        {cert.drive_url && (
          <a 
            href={cert.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-800 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full transition-colors"
            onClick={e => e.stopPropagation()}
          >
            Drive <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Heart, Eye, ExternalLink, GraduationCap, Briefcase, Building2, UserCircle, BookOpen, Award, Home, MapPin, Map, Flag, Globe } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';
import confetti from 'canvas-confetti';

export default function CertCard({ cert, style, onClick, viewMode = 'grid' }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(cert.likes ?? 0);

  const handleLike = async (e) => {
    e.stopPropagation(); // prevent modal opening
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1);

    if (newIsLiked) {
      // Mini heart pop effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { x, y },
        colors: ['#ef4444', '#f43f5e', '#fb7185'],
        shapes: ['circle'],
        disableForReducedMotion: true,
        zIndex: 100,
        scalar: 0.6,
        gravity: 1.5,
        ticks: 50
      });
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      await fetch(`${apiUrl}/api/certificates/${cert.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLike: newIsLiked })
      });
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  };

  const ownerConfig = TAG_CONFIG.owner_type[cert.owner_type] || TAG_CONFIG.owner_type["นักเรียน"];
  const itemConfig  = TAG_CONFIG.item_type[cert.item_type]   || TAG_CONFIG.item_type["รางวัล/การแข่งขัน"];

  const dateStr = cert.created_at
    ? new Date(cert.created_at).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })
    : '';

  /* ─────────── LIST VIEW ─────────── */
  if (viewMode === 'list') {
    return (
      <div
        className="group w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer overflow-hidden flex"
        style={style}
        onClick={() => onClick && onClick(cert)}
      >
        {/* Thumb */}
        <div className="relative flex-shrink-0 w-24 sm:w-36 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!imgError ? (
            <img
              src={cert.image_url}
              alt=""
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <Award className="text-slate-300 dark:text-slate-600" size={28} />
          )}
          {/* Level badge */}
          <div className="absolute bottom-1 left-1">
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${itemConfig.bg} ${itemConfig.text}`}>
              {cert.item_type === 'รางวัล/การแข่งขัน' ? <Award size={8} /> : <BookOpen size={8} />}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 px-4 py-3 gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={cert.user_avatar}
                alt={cert.user_name}
                className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-600 flex-shrink-0 object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{cert.user_name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{dateStr}</p>
              </div>
            </div>
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ownerConfig.bg} ${ownerConfig.text} border ${ownerConfig.border}`}>
              {ownerConfig.icon} {cert.owner_type}
            </span>
          </div>

          {cert.ocr_text && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{cert.ocr_text}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
              >
                <Heart size={12} className={isLiked ? "fill-red-500 animate-heart-pop" : ""} /> {likes}
              </button>
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <Eye size={12} /> {cert.views ?? 0}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${itemConfig.bg} ${itemConfig.text} border ${itemConfig.border}`}>
                {itemConfig.icon} {cert.item_type}
              </span>
            </div>
            {cert.drive_url && (
              <a
                href={cert.drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-700 transition-all flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Drive <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────── GRID VIEW ─────────── */
  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
      style={style}
      onClick={() => onClick && onClick(cert)}
    >
      {/* Image */}
      <div className="relative bg-slate-100 dark:bg-slate-900 aspect-[4/3] flex items-center justify-center overflow-hidden flex-shrink-0">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!imgError ? (
          <img
            src={cert.image_url}
            alt=""
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <Award className="text-slate-300 dark:text-slate-600" size={36} />
        )}

        {/* Type badge top-left */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${itemConfig.bg} ${itemConfig.text} border ${itemConfig.border}`}>
            {itemConfig.icon} {cert.item_type}
          </span>
        </div>

        {/* Hover overlay: view */}
        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold bg-blue-600/90 rounded-full px-3 py-1.5 shadow flex items-center gap-1.5">
            <Eye size={12} /> ดูรายละเอียด
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* User row */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={cert.user_avatar}
            alt={cert.user_name}
            className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-600 flex-shrink-0 object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{cert.user_name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{dateStr}</p>
          </div>
        </div>

        {/* Owner tag */}
        <span className={`self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ownerConfig.bg} ${ownerConfig.text} border ${ownerConfig.border}`}>
          {ownerConfig.icon} {cert.owner_type}
        </span>

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-dashed border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 text-[11px] transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
            >
              <Heart size={11} className={isLiked ? "fill-red-500 animate-heart-pop" : ""} /> {likes}
            </button>
            <span className="flex items-center gap-1 text-slate-400 text-[11px]"><Eye size={11} /> {cert.views ?? 0}</span>
          </div>
          {cert.drive_url && (
            <a
              href={cert.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              Drive
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

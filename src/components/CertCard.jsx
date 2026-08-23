import { useState } from 'react';
import { Heart, MessageCircle, Share2, ExternalLink, Eye, MoreHorizontal, Clock } from 'lucide-react';
import { TAG_CONFIG } from '../data/certificates';

function Tag({ type, value }) {
  const cfgMap = type === 'owner_type' ? TAG_CONFIG.owner_type
    : type === 'item_type' ? TAG_CONFIG.item_type
    : TAG_CONFIG.level;
  const cfg = cfgMap[value] || { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', icon: '•' };

  return (
    <span className={`tag border text-xs ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span>{cfg.icon}</span>
      {value}
    </span>
  );
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'เมื่อกี้';
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `${days} วันที่แล้ว`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} เดือนที่แล้ว`;
  return `${Math.floor(months / 12)} ปีที่แล้ว`;
}

export default function CertCard({ cert, style }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(cert.likes);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const shortText = cert.ocr_text.length > 120
    ? cert.ocr_text.slice(0, 120) + '...'
    : cert.ocr_text;

  return (
    <article
      className="feed-card overflow-hidden"
      style={style}
      id={`cert-card-${cert.id}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={cert.user_avatar}
              alt={cert.user_name}
              className="w-10 h-10 rounded-full ring-2 ring-white/10 object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
              {TAG_CONFIG.owner_type[cert.owner_type]?.icon}
            </div>
          </div>

          {/* User Info */}
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-tight hover:text-brand-300 cursor-pointer transition-colors">
              {cert.user_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock size={10} className="text-slate-500" />
              <time className="text-[11px] text-slate-500">{timeAgo(cert.created_at)}</time>
            </div>
          </div>
        </div>

        <button className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all">
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Tags Row */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        <Tag type="owner_type" value={cert.owner_type} />
        <Tag type="item_type" value={cert.item_type} />
        <Tag type="level" value={cert.level} />
      </div>

      {/* Certificate Image */}
      <div className="relative mx-4 rounded-xl overflow-hidden bg-slate-800/50 mb-3"
        style={{ aspectRatio: '16/9' }}>
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 shimmer" />
        )}
        {!imgError ? (
          <img
            src={cert.image_url}
            alt="Certificate"
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="text-3xl">🏆</div>
            <p className="text-xs text-slate-500">ไม่สามารถโหลดรูปภาพได้</p>
          </div>
        )}

        {/* Image overlay gradient */}
        {imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
        )}

        {/* View full button overlay */}
        {imgLoaded && (
          <button className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/80 bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:text-white transition-all border border-white/10">
            <Eye size={11} />
            ดูภาพเต็ม
          </button>
        )}
      </div>

      {/* OCR Text */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-300 leading-relaxed">
          {expanded ? cert.ocr_text : shortText}
        </p>
        {cert.ocr_text.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-brand-400 hover:text-brand-300 mt-1 transition-colors font-medium"
          >
            {expanded ? 'ย่อลง' : 'อ่านเพิ่มเติม'}
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5" />

      {/* Action Bar */}
      <div className="flex items-center px-2 py-2">
        {/* Like */}
        <button
          onClick={handleLike}
          id={`like-btn-${cert.id}`}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:bg-white/5 ${
            liked ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          <Heart
            size={15}
            className={`transition-all duration-200 ${liked ? 'fill-rose-400 scale-110' : ''}`}
          />
          <span>{likeCount.toLocaleString()}</span>
        </button>

        {/* Comment */}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-blue-400 hover:bg-white/5 transition-all duration-200">
          <MessageCircle size={15} />
          <span>{cert.comments}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-all duration-200">
          <Share2 size={15} />
          <span className="hidden sm:inline">แชร์</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* External link */}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200">
          <ExternalLink size={13} />
        </button>
      </div>
    </article>
  );
}

import { useState } from 'react';
import CertCard from './CertCard';
import { Loader2, SearchX, LayoutGrid, List, TrendingUp, Clock, Award } from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'latest', label: 'ล่าสุด', icon: Clock },
  { id: 'popular', label: 'ยอดนิยม', icon: TrendingUp },
  { id: 'award', label: 'รางวัล', icon: Award },
];

export default function Feed({ certificates, isLoading }) {
  const [sort, setSort] = useState('latest');
  const [view, setView] = useState('list'); // 'list' | 'grid'

  const sorted = [...certificates].sort((a, b) => {
    if (sort === 'popular') return b.likes - a.likes;
    if (sort === 'award') return a.item_type === 'รางวัล/การแข่งขัน' ? -1 : 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <main className="flex-1 min-h-screen">
      {/* Feed Toolbar */}
      <div className="glass-card rounded-2xl p-3 mb-4 flex items-center justify-between gap-3">
        {/* Sort tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`sort-${id}`}
              onClick={() => setSort(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                sort === id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Count + View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            <span className="text-slate-200 font-semibold">{certificates.length}</span> รายการ
          </span>
          <div className="flex items-center bg-white/5 rounded-xl p-1">
            <button
              id="view-list"
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <List size={13} />
            </button>
            <button
              id="view-grid"
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 size={32} className="text-brand-400 animate-spin" />
          <p className="text-slate-400 text-sm">กำลังโหลดเกียรติบัตร...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center">
            <SearchX size={28} className="text-slate-500" />
          </div>
          <div>
            <p className="text-slate-200 font-semibold mb-1">ไม่พบเกียรติบัตร</p>
            <p className="text-slate-500 text-sm">ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น</p>
          </div>
        </div>
      )}

      {/* Certificate Cards */}
      {!isLoading && sorted.length > 0 && (
        <div
          className={`animate-stagger ${
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
              : 'flex flex-col gap-4'
          }`}
        >
          {sorted.map((cert, i) => (
            <CertCard
              key={cert.id}
              cert={cert}
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

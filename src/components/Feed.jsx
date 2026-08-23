import { useState } from 'react';
import CertCard from './CertCard';
import { Loader2, SearchX, LayoutGrid, List } from 'lucide-react';

export default function Feed({ certificates, isLoading }) {
  const [activeTab, setActiveTab] = useState('ล่าสุด');
  const [view, setView] = useState('list'); // 'list' | 'grid'

  const sorted = [...certificates].sort((a, b) => {
    if (activeTab === 'ยอดนิยม') return b.likes - a.likes;
    if (activeTab === 'รางวัล') return a.item_type === 'รางวัล/การแข่งขัน' ? -1 : 1;
    return new Date(b.created_at) - new Date(a.created_at); // ล่าสุด / ทั้งหมด
  });

  return (
    <main className="flex-1 min-h-screen">
      {/* Feed Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {/* Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border-4 border-white shadow-sm w-full sm:w-auto overflow-x-auto">
          {['ล่าสุด', 'ยอดนิยม', 'รางวัล'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-pink-100 text-pink-600 shadow-sm transform scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Count + View Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-2xl border-2 border-white shadow-sm">
            <span className="text-pink-500 text-lg">{certificates.length}</span> ผลงาน
          </span>
          <div className="flex items-center bg-white rounded-2xl p-1 border-2 border-white shadow-sm">
            <button
              id="view-list"
              onClick={() => setView('list')}
              className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <List size={18} />
            </button>
            <button
              id="view-grid"
              onClick={() => setView('grid')}
              className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">กำลังโหลดผลงานคนเก่ง...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-24 h-24 rounded-3xl bg-white shadow-sm border-4 border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-5xl">🔍</span>
          </div>
          <div>
            <p className="text-slate-700 font-bold text-lg mb-1">ยังไม่มีผลงานในหมวดหมู่นี้</p>
            <p className="text-slate-500 text-sm">ลองเปลี่ยนตัวกรอง หรือค้นหาใหม่ดูนะ 🌟</p>
          </div>
        </div>
      )}

      {/* Certificate Cards */}
      {!isLoading && sorted.length > 0 && (
        <div
          className={`animate-stagger ${
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
              : 'flex flex-col gap-6'
          }`}
        >
          {sorted.map((cert, i) => (
            <CertCard
              key={cert.id}
              cert={cert}
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

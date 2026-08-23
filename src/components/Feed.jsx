import { useState } from 'react';
import CertCard from './CertCard';
import CertificateModal from './CertificateModal';
import { Loader2, SearchX, LayoutGrid, List } from 'lucide-react';

export default function Feed({ certificates, isLoading }) {
  const [activeTab, setActiveTab] = useState('ล่าสุด');
  const [selectedCert, setSelectedCert] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-blue-400 dark:text-pink-500 animate-pulse">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold text-lg">กำลังโหลดผลงาน...</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4 shadow-inner">
          <SearchX size={48} />
        </div>
        <p className="font-bold text-lg">ไม่พบผลงานที่คุณค้นหา</p>
        <p className="text-sm mt-2">ลองเปลี่ยนตัวกรองดูนะ</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tool bar (Tabs & View toggles) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm w-full sm:w-auto overflow-x-auto">
          {['ทั้งหมด', 'ล่าสุด', 'ยอดนิยม'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-pink-500/20 dark:text-pink-400'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 bg-white dark:bg-slate-900 p-1 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 dark:bg-pink-500/20 dark:text-pink-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 dark:bg-pink-500/20 dark:text-pink-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Grid or List View */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-6 animate-stagger"
        : "flex flex-col gap-4 max-w-4xl animate-stagger"
      }>
        {certificates.map((cert, index) => (
          <CertCard 
            key={cert.id} 
            cert={cert} 
            onClick={setSelectedCert}
            viewMode={viewMode}
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedCert && (
        <CertificateModal 
          cert={selectedCert} 
          onClose={() => setSelectedCert(null)} 
        />
      )}
    </div>
  );
}

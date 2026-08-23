import { useState, useMemo } from 'react';
import { dummyCertificates, TAG_CONFIG } from '../data/certificates';
import Feed from '../components/Feed';
import { useAuth } from '../context/AuthContext';
import { Filter, X } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  
  // Filter state
  const [filters, setFilters] = useState({
    ownerType: [],
    itemType: [],
    level: [],
  });

  const handleFilterToggle = (groupKey, value) => {
    setFilters(prev => {
      const current = prev[groupKey];
      return {
        ...prev,
        [groupKey]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  const handleClearFilters = () => {
    setFilters({ ownerType: [], itemType: [], level: [] });
  };

  const filtered = useMemo(() => {
    return dummyCertificates.filter(cert => {
      const ownerOk = filters.ownerType.length === 0 || filters.ownerType.includes(cert.owner_type);
      const itemOk  = filters.itemType.length === 0  || filters.itemType.includes(cert.item_type);
      const levelOk = filters.level.length === 0     || filters.level.includes(cert.level);
      return ownerOk && itemOk && levelOk;
    });
  }, [filters]);

  const renderFilterGroup = (title, groupKey, configObj) => (
    <div className="mb-4">
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 px-1 flex items-center gap-1.5">
        <span className="text-pink-400">✨</span> {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(configObj).map(([key, config]) => {
          const isActive = filters[groupKey].includes(key);
          return (
            <button 
              key={key} 
              onClick={() => handleFilterToggle(groupKey, key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-pink-500 dark:bg-pink-500/20 dark:text-pink-300' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-pink-400'
              }`}
            >
              <span className="text-sm">{config.icon}</span>
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );

  const hasActiveFilters = filters.ownerType.length > 0 || filters.itemType.length > 0 || filters.level.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      
      {/* Hero Banner */}
      <div className="glass-card rounded-3xl p-8 mb-8 text-center relative overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 dark:bg-pink-900 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-2xl -ml-10 -mb-10 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-4 animate-bounce-slow">
            <img src="/logo.png" alt="School Logo" className="w-24 h-24 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-slate-800 dark:text-white tracking-tight">
            แฟ้มสะสมผลงาน <span className="gradient-text">โรงเรียนอนุบาลเลย</span>
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
            พื้นที่แห่งความภูมิใจ รวบรวมผลงาน เกียรติบัตร และรอยยิ้มของนักเรียนและบุคลากร 🏫
          </p>
          
          {!user && (
            <button
              onClick={() => alert('ฟังก์ชันเข้าสู่ระบบอยู่ที่มุมขวาบน ↗️')}
              className="btn-primary mt-6 text-base tracking-wide px-8 py-2.5"
            >
              ✨ เพิ่มผลงานใหม่ ✨
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Filters Top/Side bar */}
        <div className="w-full xl:w-72 flex-shrink-0">
          <div className="glass-card p-5 sticky top-24 border-2 border-white dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Filter size={18} className="text-blue-500 dark:text-pink-500" /> ตัวกรอง
              </h2>
              {hasActiveFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-pink-500 hover:text-pink-600 bg-pink-50 dark:bg-pink-500/20 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <X size={14} /> ล้างทั้งหมด
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {renderFilterGroup("ผลงานของใครเอ่ย?", "ownerType", TAG_CONFIG.owner_type)}
              {renderFilterGroup("ประเภทผลงาน", "itemType", TAG_CONFIG.item_type)}
              {renderFilterGroup("ระดับรางวัล", "level", TAG_CONFIG.level)}
            </div>
          </div>
        </div>

        {/* Main Feed Content */}
        <div className="flex-1 w-full min-w-0">
          <Feed certificates={filtered} isLoading={false} />
        </div>
      </div>

    </div>
  );
}

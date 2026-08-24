import { useState, useMemo, useEffect } from 'react';
import { TAG_CONFIG } from '../data/certificates';
import Feed from '../components/Feed';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Filter, X, Award, Users, GraduationCap } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const { logoUrl } = useSettings();
  
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    ownerType: [],
    itemType: [],
    level: [],
  });

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
        const res = await fetch(`${apiUrl}/api/certificates`);
        const data = await res.json();
        if (data.success) setCertificates(data.certificates);
      } catch (err) {
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

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
    return certificates.filter(cert => {
      const ownerOk = filters.ownerType.length === 0 || filters.ownerType.includes(cert.owner_type);
      const itemOk  = filters.itemType.length === 0  || filters.itemType.includes(cert.item_type);
      const levelOk = filters.level.length === 0     || filters.level.includes(cert.level);
      return ownerOk && itemOk && levelOk;
    });
  }, [filters, certificates]);

  const renderFilterChips = (groupKey, configObj) => (
    <div className="flex flex-wrap gap-2">
      {Object.entries(configObj).map(([key, config]) => {
        const isActive = filters[groupKey].includes(key);
        return (
          <button 
            key={key} 
            onClick={() => handleFilterToggle(groupKey, key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
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
  );

  const hasActiveFilters = filters.ownerType.length > 0 || filters.itemType.length > 0 || filters.level.length > 0;

  // Stats calculation
  const totalCerts = certificates.length;
  const teacherCerts = certificates.filter(c => c.owner_type === 'ครูผู้สอน').length;
  const studentCerts = certificates.filter(c => c.owner_type === 'นักเรียน').length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      
      {/* Hero Banner with Stats */}
      <div className="glass-card rounded-3xl p-6 md:p-10 mb-8 text-center relative overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 dark:bg-pink-900 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-2xl -ml-10 -mb-10 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6 animate-bounce-slow">
            <img 
              src={logoUrl} 
              alt="School Logo" 
              className="w-28 h-28 object-contain drop-shadow-md bg-white rounded-full p-1 border-4 border-blue-100 dark:border-slate-600" 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=School&background=1d4ed8&color=fff"; }}
            />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-800 dark:text-white tracking-tight">
            แฟ้มสะสมผลงาน <span className="gradient-text">โรงเรียนอนุบาลเลย</span>
          </h2>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium mb-8">
            พื้นที่แห่งความภูมิใจ รวบรวมผลงาน เกียรติบัตร และรอยยิ้มของนักเรียนและบุคลากร
          </p>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-white dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-center mb-2"><Award className="text-blue-500 dark:text-pink-400" size={28}/></div>
              <div className="text-2xl font-black text-slate-800 dark:text-white">{totalCerts}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">ผลงานทั้งหมด</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-white dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-center mb-2"><Users className="text-blue-500 dark:text-pink-400" size={28}/></div>
              <div className="text-2xl font-black text-slate-800 dark:text-white">{teacherCerts}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">ผลงานคุณครู</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-white dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:scale-105 transition-transform">
              <div className="flex justify-center mb-2"><GraduationCap className="text-blue-500 dark:text-pink-400" size={28}/></div>
              <div className="text-2xl font-black text-slate-800 dark:text-white">{studentCerts}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">ผลงานนักเรียน</div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="glass-card p-4 md:p-6 mb-8 rounded-3xl border-2 border-white dark:border-slate-700 sticky top-16 z-30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Filter size={20} className="text-blue-500 dark:text-pink-500" /> ตัวกรองผลงาน
          </h2>
          {hasActiveFilters && (
            <button 
              onClick={handleClearFilters}
              className="text-xs font-bold text-pink-500 hover:text-pink-600 bg-pink-50 dark:bg-pink-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors self-start md:self-auto"
            >
              <X size={14} /> ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">ผลงานของใคร?</h3>
            {renderFilterChips("ownerType", TAG_CONFIG.owner_type)}
          </div>
          <div className="hidden xl:block w-px bg-slate-200 dark:bg-slate-700 mx-2 self-stretch"></div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">ประเภทผลงาน</h3>
            {renderFilterChips("itemType", TAG_CONFIG.item_type)}
          </div>
          <div className="hidden xl:block w-px bg-slate-200 dark:bg-slate-700 mx-2 self-stretch"></div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">ระดับรางวัล</h3>
            {renderFilterChips("level", TAG_CONFIG.level)}
          </div>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="w-full">
        <Feed certificates={filtered} isLoading={loading} />
      </div>

    </div>
  );
}

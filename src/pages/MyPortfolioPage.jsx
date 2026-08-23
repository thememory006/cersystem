import { useAuth } from '../context/AuthContext';
import { dummyCertificates } from '../data/certificates';
import CertCard from '../components/CertCard';
import { Plus } from 'lucide-react';

export default function MyPortfolioPage() {
  const { user } = useAuth();
  
  // Dummy logic: filter certificates belonging to this user
  // (In real app, we fetch from API using user.uid)
  const myCerts = dummyCertificates.slice(0, 3); // mock just taking first 3

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      
      {/* Header Profile Section */}
      <div className="glass-card rounded-3xl p-8 mb-8 border-4 border-white dark:border-slate-700 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl -mr-20 -mt-20 opacity-30 pointer-events-none"></div>
        
        <img 
          src={user?.avatar} 
          alt={user?.name} 
          className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-pink-500 shadow-lg relative z-10"
        />
        
        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-pink-500/20 dark:text-pink-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            {user?.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'คุณครู / นักเรียน'}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
            แฟ้มสะสมผลงานของฉัน
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {user?.name} • {user?.email}
          </p>
        </div>

        <button className="btn-primary flex items-center gap-2 mt-4 md:mt-0 relative z-10">
          <Plus size={20} /> เพิ่มผลงานใหม่
        </button>
      </div>

      {/* Portfolio Grid */}
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
        <span className="text-pink-500">🌟</span> ผลงานทั้งหมดของฉัน
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-stagger">
        {myCerts.map((cert, i) => (
          <CertCard key={cert.id} cert={cert} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>

    </div>
  );
}

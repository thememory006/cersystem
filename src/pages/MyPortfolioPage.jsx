import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CertCard from '../components/CertCard';
import UploadModal from '../components/UploadModal';
import { Plus, Award, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function MyPortfolioPage() {
  const { user } = useAuth();
  const [myCerts, setMyCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchMyCerts = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/certificates?userId=${user.uid}`);
      const data = await res.json();
      if (data.success) {
        setMyCerts(data.certificates);
      }
    } catch (err) {
      console.error("Error fetching my certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCerts();
  }, [user]);

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

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 relative z-10">
          <button 
            onClick={() => {
              const embedUrl = `${window.location.origin}/embed/${encodeURIComponent(user?.name || 'demo')}`;
              const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border:none; border-radius:12px; overflow:hidden;"></iframe>`;
              
              Swal.fire({
                title: 'โค้ดสำหรับฝัง (Embed)',
                html: `
                  <p class="text-sm text-slate-500 mb-4">คัดลอกโค้ดด้านล่างเพื่อนำไปแปะในเว็บไซต์ของคุณ</p>
                  <textarea readonly class="w-full h-32 p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500">${iframeCode}</textarea>
                `,
                showCancelButton: true,
                confirmButtonText: 'คัดลอกโค้ด',
                cancelButtonText: 'ปิด',
                confirmButtonColor: '#3b82f6',
                customClass: {
                  popup: 'rounded-3xl dark:bg-slate-900',
                  title: 'dark:text-white',
                  confirmButton: 'rounded-xl',
                  cancelButton: 'rounded-xl'
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  navigator.clipboard.writeText(iframeCode);
                  toast.success('คัดลอกโค้ดเรียบร้อยแล้ว!');
                }
              });
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 size={20} /> แชร์ / นำไปฝัง
          </button>
          
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={20} /> เพิ่มผลงานใหม่
          </button>
        </div>
      </div>

      {/* Portfolio Grid */}
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
        <Award className="text-pink-500" size={24} /> ผลงานทั้งหมดของฉัน
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-stagger min-h-[200px]">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-full">
            <span className="text-slate-400">กำลังโหลดผลงาน...</span>
          </div>
        ) : myCerts.length > 0 ? (
          myCerts.map((cert, i) => (
            <CertCard key={cert.id} cert={cert} style={{ animationDelay: `${i * 0.1}s` }} />
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center h-full">
            <span className="text-slate-400">ยังไม่มีผลงานในระบบ</span>
          </div>
        )}
      </div>

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onUploadSuccess={() => {
            setShowUploadModal(false);
            fetchMyCerts();
          }}
        />
      )}

    </div>
  );
}

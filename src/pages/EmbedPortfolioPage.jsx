import { useParams } from 'react-router-dom';
import { dummyCertificates } from '../data/certificates';
import CertCard from '../components/CertCard';
import { Award, SearchX } from 'lucide-react';
import { useState } from 'react';
import CertificateModal from '../components/CertificateModal';

export default function EmbedPortfolioPage() {
  const { username } = useParams();
  const [selectedCert, setSelectedCert] = useState(null);
  
  // In a real app, you would fetch the specific user's certs by ID from the API
  // Here we use a naive decodeURIComponent of the username param
  const decodedUsername = decodeURIComponent(username || '');
  
  // Filter dummy certs matching the username, or just show a fallback if not found
  const userCerts = dummyCertificates.filter(
    (c) => c.user_name === decodedUsername || username === 'demo'
  );

  // If we used 'demo', just use the first 4 certs
  const displayCerts = username === 'demo' ? dummyCertificates.slice(0, 4) : userCerts;

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 font-sans antialiased text-slate-800 dark:text-slate-200">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Award size={24} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">
            แฟ้มสะสมผลงาน
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {decodedUsername || 'ผู้ใช้งาน'}
          </p>
        </div>
      </div>

      {/* Grid */}
      {displayCerts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 animate-stagger">
          {displayCerts.map((cert, i) => (
            <CertCard 
              key={cert.id} 
              cert={cert} 
              onClick={setSelectedCert} 
              style={{ animationDelay: `${i * 0.05}s` }} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
            <SearchX size={32} />
          </div>
          <p className="font-bold">ไม่พบผลงาน</p>
        </div>
      )}

      {/* Modal */}
      {selectedCert && (
        <CertificateModal 
          cert={selectedCert} 
          onClose={() => setSelectedCert(null)} 
        />
      )}

      {/* Watermark/Footer */}
      <div className="mt-8 text-center">
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest">
          ขับเคลื่อนโดย SchoolPort
        </a>
      </div>
      
    </div>
  );
}

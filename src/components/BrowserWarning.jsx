import { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrowserWarning() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Detect LINE, Facebook, IG in-app browsers
    const isLine = /Line/i.test(userAgent);
    const isFB = /FBAN|FBAV/i.test(userAgent);
    const isIG = /Instagram/i.test(userAgent);
    
    if (isLine || isFB || isIG) {
      setIsInAppBrowser(true);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('คัดลอกลิงก์สำเร็จ!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isInAppBrowser) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up border-4 border-slate-100 dark:border-slate-700">
        
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} />
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-3">
          เบราว์เซอร์ไม่รองรับ
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
          เพื่อการใช้งานที่สมบูรณ์แบบและการเข้าสู่ระบบที่ไม่มีปัญหา กรุณาเปิดลิงก์นี้ในเบราว์เซอร์หลักของเครื่อง (เช่น Safari หรือ Chrome)
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 font-bold py-3.5 px-6 rounded-xl transition-all"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
          </button>
          
          {/* For iOS Safari shortcut */}
          <a 
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md"
          >
            เปิดในเบราว์เซอร์ <ExternalLink size={20} />
          </a>
        </div>
        
      </div>
    </div>
  );
}

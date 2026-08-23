import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import SettingsPage from './pages/SettingsPage';
import { dummyCertificates } from './data/certificates';

// Kindergarten Theme Decor
function DecorElements() {
  return (
    <>
      <div className="decor-cloud text-pink-200 pointer-events-none" style={{ top: '10%', left: '5%' }}>☁️</div>
      <div className="decor-cloud text-blue-200 pointer-events-none" style={{ top: '25%', right: '10%', animationDelay: '1s' }}>☁️</div>
      <div className="decor-cloud text-yellow-100 pointer-events-none" style={{ bottom: '15%', left: '15%', animationDelay: '2.5s' }}>☁️</div>
      
      <div className="decor-star text-yellow-300 pointer-events-none" style={{ top: '15%', left: '20%', animationDelay: '0.5s' }}>⭐</div>
      <div className="decor-star text-yellow-300 pointer-events-none" style={{ top: '35%', right: '25%', animationDelay: '1.5s' }}>⭐</div>
      <div className="decor-star text-yellow-300 pointer-events-none" style={{ bottom: '25%', right: '15%', animationDelay: '0.8s' }}>⭐</div>
    </>
  );
}

// Login Modal (demo)
function LoginModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card relative z-10 rounded-3xl p-8 w-full max-w-sm animate-fade-in-up border-4 border-white">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-pink-500">
          ✖️
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border-4 border-blue-100">
            <img src="/logo.png" alt="School Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=School&background=1d4ed8&color=fff"; }} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-blue-700">อนุบาลเลยพอร์ต</h2>
            <p className="text-sm text-slate-500 mt-1">เข้าสู่ระบบเพื่อเพิ่มผลงานของหนูๆ</p>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          id="google-login-btn"
          onClick={() => onLogin({ name: 'คุณครูทดสอบ', avatar: 'https://ui-avatars.com/api/?name=คุณครู&background=ffb3c6&color=fff&bold=true' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-sm hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Page routing: 'dashboard' | 'settings'
  const [page, setPage] = useState('dashboard');

  // Filter state
  const [filters, setFilters] = useState({
    ownerType: [],
    itemType: [],
    level: [],
  });

  // Filter toggle
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

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({ ownerType: [], itemType: [], level: [] });
  };

  // Apply filters
  const filtered = useMemo(() => {
    return dummyCertificates.filter(cert => {
      const ownerOk = filters.ownerType.length === 0 || filters.ownerType.includes(cert.owner_type);
      const itemOk  = filters.itemType.length === 0  || filters.itemType.includes(cert.item_type);
      const levelOk = filters.level.length === 0     || filters.level.includes(cert.level);
      return ownerOk && itemOk && levelOk;
    });
  }, [filters]);

  // Auth handlers
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleSettingsClick = () => {
    setPage('settings');
  };

  return (
    <div className="relative min-h-screen">
      <DecorElements />

      {/* Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onSettingsClick={handleSettingsClick}
      />

      {/* Page: Settings */}
      {page === 'settings' && (
        <div className="relative z-10 pt-16">
          <SettingsPage onBack={() => setPage('dashboard')} />
        </div>
      )}

      {/* Page: Dashboard */}
      {page === 'dashboard' && (
        <div className="relative z-10 flex flex-col lg:flex-row min-h-screen pt-16">
          {/* Left Sidebar */}
          <Sidebar
            filters={filters}
            onToggle={handleFilterToggle}
            onClear={handleClearFilters}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-64 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
            {/* Hero Banner */}
            <div className="glass-card rounded-3xl p-8 mb-8 text-center relative overflow-hidden border-4 border-white shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 rounded-full blur-2xl -ml-10 -mb-10"></div>
              
              <div className="relative z-10">
                <div className="flex justify-center mb-4 animate-bounce-slow">
                  <img src="/logo.png" alt="School Logo" className="w-24 h-24 object-contain" onError={(e) => e.target.style.display = 'none'} />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-slate-700">
                  แฟ้มสะสมผลงาน <span className="text-blue-600">โรงเรียนอนุบาลเลย</span>
                </h2>
                <p className="text-base text-slate-500 max-w-xl mx-auto font-medium">
                  พื้นที่แห่งความภูมิใจ รวบรวมผลงาน เกียรติบัตร และรอยยิ้มของนักเรียนและบุคลากร
                </p>
                
                {!isLoggedIn && (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="btn-primary mt-6 text-lg tracking-wide px-8 py-3"
                  >
                    ✨ เพิ่มผลงานใหม่ ✨
                  </button>
                )}
              </div>
            </div>

            {/* Feed */}
            <Feed certificates={filtered} isLoading={false} />
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

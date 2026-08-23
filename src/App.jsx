import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import SettingsPage from './pages/SettingsPage';
import { dummyCertificates } from './data/certificates';

// Ambient background orbs
function BackgroundOrbs() {
  return (
    <>
      <div
        className="orb w-96 h-96 opacity-20"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          top: '10%',
          left: '5%',
          animationDelay: '0s',
        }}
      />
      <div
        className="orb w-80 h-80 opacity-15"
        style={{
          background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
          top: '60%',
          right: '8%',
          animationDelay: '3s',
        }}
      />
      <div
        className="orb w-64 h-64 opacity-10"
        style={{
          background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
          bottom: '10%',
          left: '30%',
          animationDelay: '6s',
        }}
      />
    </>
  );
}

// Login Modal (demo)
function LoginModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card relative z-10 rounded-2xl p-8 w-full max-w-sm animate-fade-in-up border border-white/10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}
          >
            🏆
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold gradient-text">SchoolPort</h2>
            <p className="text-sm text-slate-400 mt-0.5">เข้าสู่ระบบเพื่อเพิ่มเกียรติบัตร</p>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          id="google-login-btn"
          onClick={() => onLogin({ name: 'Admin ทดสอบ', avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&bold=true' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-all duration-200 shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>

        <p className="text-center text-xs text-slate-600 mt-4">
          การเข้าสู่ระบบต้องใช้บัญชี Google ของโรงเรียน
        </p>
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
      <BackgroundOrbs />

      {/* Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onSettingsClick={handleSettingsClick}
      />

      {/* Page: Settings */}
      {page === 'settings' && (
        <div className="relative z-10">
          <SettingsPage onBack={() => setPage('dashboard')} />
        </div>
      )}

      {/* Page: Dashboard */}
      {page === 'dashboard' && (
        <div className="relative z-10 flex min-h-screen pt-16">
          {/* Left Sidebar */}
          <Sidebar
            filters={filters}
            onToggle={handleFilterToggle}
            onClear={handleClearFilters}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-64 px-4 md:px-6 py-6 max-w-3xl mx-auto w-full">
            {/* Hero Banner */}
            <div
              className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.10) 50%, rgba(236,72,153,0.08) 100%)',
                borderColor: 'rgba(99,102,241,0.2)',
              }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 opacity-20"
                style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">🏫 SchoolPort Dashboard</p>
                <h2 className="text-xl font-extrabold text-white mb-1">
                  ระบบเก็บเกียรติบัตร & Portfolio
                </h2>
                <p className="text-sm text-slate-400 max-w-md">
                  แพลตฟอร์มแสดงผลงาน เกียรติบัตร และรางวัลของสถานศึกษา
                  ผู้บริหาร ครู และนักเรียน — เก็บข้อมูลใน Google Drive อย่างเป็นระบบ
                </p>
                {!isLoggedIn && (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
                  >
                    <span>เพิ่มเกียรติบัตรของคุณ</span>
                    <span>→</span>
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

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { LogOut, Settings, User, Moon, Sun, Monitor, Folder } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { confirmLogout } from '../utils/alert';

export default function Navbar() {
  const { user, loginWithGoogle, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { logoUrl } = useSettings();
  
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="glass-nav fixed top-0 w-full z-50 h-16 flex items-center">
      <div className="w-full px-4 md:px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden border-2 border-blue-100 dark:border-pink-500">
            <img src={logoUrl} alt="School Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=School&background=1d4ed8&color=fff"; }} />
          </div>
          <span className="text-xl font-extrabold text-blue-700 dark:text-pink-400 tracking-tight hidden sm:block">
            อนุบาลเลยพอร์ต
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-pink-400 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
            </button>
            
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-36 glass-card rounded-xl shadow-lg py-2 animate-fade-in-up border border-slate-100 dark:border-slate-700">
                <button onClick={() => {setTheme('light'); setShowThemeMenu(false)}} className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-slate-800 ${theme==='light' ? 'text-blue-600 dark:text-pink-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                  <Sun size={16} /> สว่าง
                </button>
                <button onClick={() => {setTheme('dark'); setShowThemeMenu(false)}} className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-slate-800 ${theme==='dark' ? 'text-blue-600 dark:text-pink-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                  <Moon size={16} /> มืด
                </button>
                <button onClick={() => {setTheme('auto'); setShowThemeMenu(false)}} className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-slate-800 ${theme==='auto' ? 'text-blue-600 dark:text-pink-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                  <Monitor size={16} /> อัตโนมัติ
                </button>
              </div>
            )}
          </div>

          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l-2 border-dashed border-blue-100 dark:border-slate-700">
              {/* My Portfolio Link (shown when sidebar is hidden) */}
              <Link 
                to="/my-portfolio" 
                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-pink-400 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="แฟ้มผลงานของฉัน"
              >
                <Folder size={20} />
              </Link>
              
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-blue-500 dark:text-pink-400 font-semibold uppercase">{user.role}</p>
              </div>
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-200 dark:border-pink-500 shadow-sm"
              />
              <button 
                onClick={async () => {
                  if (await confirmLogout()) {
                    logout();
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="ออกจากระบบ"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="btn-primary text-xs sm:text-sm shadow-sm py-2 px-4"
            >
              เข้าสู่ระบบ 🍎
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

import { LogOut, Settings } from 'lucide-react';

export default function Navbar({ isLoggedIn, user, onLoginClick, onSettingsClick }) {
  return (
    <nav className="glass-nav fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden border-2 border-blue-100">
              <img src="/logo.png" alt="School Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=School&background=1d4ed8&color=fff"; }} />
            </div>
            <span className="text-xl font-extrabold text-blue-700 tracking-tight">
              อนุบาลเลยพอร์ต
            </span>
          </div>

          {/* Right Section (Auth / Settings) */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={onSettingsClick}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                  title="ตั้งค่าระบบ"
                >
                  <Settings size={20} />
                </button>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-dashed border-blue-100">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-700">{user?.name}</p>
                    <p className="text-xs text-blue-500 font-semibold">Admin (คุณครู)</p>
                  </div>
                  <img 
                    src={user?.avatar} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-blue-200 shadow-sm"
                  />
                  <button 
                    className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all ml-2"
                    title="ออกจากระบบ"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="btn-primary text-sm shadow-sm"
              >
                เข้าสู่ระบบคุณครู 🍎
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

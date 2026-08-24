import { Link, useLocation } from 'react-router-dom';
import { Home, Folder, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'หน้าแรก (Feed)', path: '/', icon: Home, show: true },
    { name: 'แฟ้มผลงานของฉัน', path: '/my-portfolio', icon: Folder, show: !!user },
    { name: 'ตั้งค่าระบบ', path: '/settings', icon: Settings, show: user?.role === 'admin' },
  ];

  // ถ้าไม่ใช่แอดมิน ไม่ต้องแสดง Sidebar เลย ตามที่ผู้ใช้ต้องการ
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg dark:bg-pink-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        glass-sidebar w-64 flex-shrink-0 fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Navigation Links */}
        <div className="p-4 space-y-2 mt-16 lg:mt-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">เมนูหลัก</div>
          
          {navItems.filter(item => item.show).map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 font-bold ${
                  isActive 
                    ? 'bg-blue-100/70 text-blue-700 dark:bg-pink-500/20 dark:text-pink-400' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600 dark:text-pink-500' : ''} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}

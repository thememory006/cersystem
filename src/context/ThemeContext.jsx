import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  // theme can be 'light', 'dark', or 'auto'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('schoolport-theme') || 'auto';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // ลบคลาสเก่าออก
    root.classList.remove('light', 'dark');

    if (theme === 'auto') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('schoolport-theme', theme);
  }, [theme]);

  // Listener สำหรับ 'auto' theme เวลาที่ผู้ใช้เปลี่ยนระบบ OS
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

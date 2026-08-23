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
    root.classList.remove('light', 'dark');

    if (theme === 'auto') {
      const currentHour = new Date().getHours();
      // 6:00 AM to 5:59 PM is light mode
      const isDaytime = currentHour >= 6 && currentHour < 18;
      root.classList.add(isDaytime ? 'light' : 'dark');
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('schoolport-theme', theme);
  }, [theme]);

  // Listener สำหรับ 'auto' theme เวลาที่ผู้ใช้เปลี่ยนระบบ OS หรือเพื่อเช็คเวลา
  useEffect(() => {
    if (theme !== 'auto') return;

    // เช็คเวลาทุกๆ 1 นาที
    const interval = setInterval(() => {
      const currentHour = new Date().getHours();
      const isDaytime = currentHour >= 6 && currentHour < 18;
      const root = window.document.documentElement;
      
      const shouldBeDark = !isDaytime;
      const isCurrentlyDark = root.classList.contains('dark');
      
      if (shouldBeDark !== isCurrentlyDark) {
        root.classList.remove('light', 'dark');
        root.classList.add(shouldBeDark ? 'dark' : 'light');
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

import { createContext, useContext, useEffect, useState } from 'react';

const FontContext = createContext();

export const useFont = () => useContext(FontContext);

export const FONT_OPTIONS = [
  { id: 'mali', label: 'มะลิ (Mali)', value: "'Mali', cursive" },
  { id: 'prompt', label: 'พร้อม (Prompt)', value: "'Prompt', sans-serif" },
  { id: 'sarabun', label: 'สารบรรณ (Sarabun)', value: "'Sarabun', sans-serif" },
  { id: 'kanit', label: 'คณิต (Kanit)', value: "'Kanit', sans-serif" },
];

export function FontProvider({ children }) {
  const [font, setFont] = useState(() => {
    return localStorage.getItem('schoolport-font') || 'mali';
  });

  useEffect(() => {
    const selectedFont = FONT_OPTIONS.find(f => f.id === font);
    if (selectedFont) {
      document.documentElement.style.setProperty('--font-family-sans', selectedFont.value);
    }
    localStorage.setItem('schoolport-font', font);
  }, [font]);

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}

import { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [logoUrl, setLogoUrl] = useState('/logo.png'); // Default local logo
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/settings`, { cache: 'no-store' });
      const data = await res.json();
      
      if (data.success && data.settings) {
        if (data.settings.logo_url) {
          setLogoUrl(data.settings.logo_url);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateLogoUrl = async (newUrl) => {
    setLogoUrl(newUrl); // Optimistic UI update
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      await fetch(`${apiUrl}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: newUrl }),
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ logoUrl, updateLogoUrl, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

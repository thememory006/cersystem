import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export function SettingsProvider({ children }) {
  const [logoUrl, setLogoUrl] = useState('/logo.png'); // Default local logo
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.success && data.settings) {
        if (data.settings.logo_url && data.settings.logo_url.trim() !== '') {
          setLogoUrl(data.settings.logo_url.trim());
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default logo on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update favicon dynamically when logoUrl changes
  useEffect(() => {
    if (logoUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = logoUrl;
    }
  }, [logoUrl]);

  const updateLogoUrl = async (newUrl) => {
    const trimmed = newUrl.trim();
    setLogoUrl(trimmed || '/logo.png'); // Optimistic UI update
    
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Refetch to confirm the saved value
      await fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error; // Re-throw so the caller can show error toast
    }
  };

  return (
    <SettingsContext.Provider value={{ logoUrl, updateLogoUrl, loading, refetchSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

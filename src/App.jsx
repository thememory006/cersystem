import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import DashboardLayout from './layouts/DashboardLayout';
import FeedPage from './pages/FeedPage';
import SettingsPage from './pages/SettingsPage';
import MyPortfolioPage from './pages/MyPortfolioPage';
import EmbedPortfolioPage from './pages/EmbedPortfolioPage';
import BrowserWarning from './components/BrowserWarning';
import { Toaster } from 'react-hot-toast';

import { FontProvider } from './context/FontContext';

// Simple guard for protected routes
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <FontProvider>
        <SettingsProvider>
          <AuthProvider>
          <BrowserWarning />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-slate-200 border-2 border-white dark:border-slate-700 shadow-xl rounded-2xl font-bold text-sm',
              style: {
                background: 'white',
                color: '#334155', // slate-700
              }
            }}
          />
          <BrowserRouter>
            <Routes>
              {/* Public Embed Route */}
              <Route path="/embed/:username" element={<EmbedPortfolioPage />} />
              
              {/* Dashboard Layout Routes */}
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<FeedPage />} />
                
                <Route path="my-portfolio" element={
                  <ProtectedRoute>
                    <MyPortfolioPage />
                  </ProtectedRoute>
                } />

                <Route path="settings" element={
                  <ProtectedRoute requireAdmin={true}>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        </SettingsProvider>
      </FontProvider>
    </ThemeProvider>
  );
}

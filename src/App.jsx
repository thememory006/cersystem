import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import FeedPage from './pages/FeedPage';
import SettingsPage from './pages/SettingsPage';
import MyPortfolioPage from './pages/MyPortfolioPage';

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
        <AuthProvider>
          <BrowserRouter>
            <Routes>
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
      </FontProvider>
    </ThemeProvider>
  );
}

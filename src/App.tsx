import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainSite from './MainSite';
import AdminPanel from './AdminPanel';
import AdminLogin from './AdminLogin';
import ListingDetailsPage from './components/pages/ListingDetailsPage';
import { FavoritesProvider } from './contexts/FavoritesContext';
import SignIn from './components/SignIn';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { ZoneLanguageProvider } from './contexts/ZoneLanguageContext';
import { CityProvider } from './contexts/CityContext';
import MyAccountPage from './components/pages/MyAccountPage'
import SettingsPage from './components/pages/SettingsPage'
import { useAuth } from './contexts/AuthContext'
import AgentLogin from './components/AgentLogin';
import AgentDashboard from './components/AgentDashboard';
import ProtectedAgentRoute from './components/ProtectedAgentRoute';
import { AgentAuthProvider } from './contexts/AgentAuthContext';
import { ChatProvider } from './contexts/ChatContext';
// Auth Guard using the admin auth context
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

// Auth Guard for user profile pages
const ProtectedUserRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
};

function AppContent() {
  return (
    <Router>
      <FavoritesProvider>
        <Routes>
          {/* Public Client-Facing Marketplace */}
          <Route path="/" element={<MainSite />} />

          {/* Listing Details Page */}
          <Route path="/listing/:id" element={<ListingDetailsPage />} />

          {/* User Profile Pages (Protected) */}
          <Route path="/account" element={<ProtectedUserRoute><MyAccountPage /></ProtectedUserRoute>} />
          <Route path="/settings" element={<ProtectedUserRoute><SettingsPage /></ProtectedUserRoute>} />

          {/* Sign In/Sign Up */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Login Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard - Protected */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />

          {/* Agent Login Portal */}
          <Route path="/agent/login" element={<AgentLogin />} />

          {/* Agent Dashboard - Protected */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedAgentRoute>
                <AgentDashboard />
              </ProtectedAgentRoute>
            }
          />

          {/* Fallback for any other route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </FavoritesProvider>
    </Router>
  );
}

function App() {
  return (
    <ZoneLanguageProvider>
      <CityProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <AgentAuthProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </AgentAuthProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </CityProvider>
    </ZoneLanguageProvider>
  );
}

export default App;

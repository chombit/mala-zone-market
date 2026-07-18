import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainSite from './MainSite'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import SignIn from './components/SignIn'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import ListingDetailsPage from './components/pages/ListingDetailsPage'
import MyAccountPage from './components/pages/MyAccountPage'
import SettingsPage from './components/pages/SettingsPage'
import { FavoritesProvider } from './contexts/FavoritesContext'

import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'

// Auth Guard using the admin auth context
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminAuth();
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

          {/* Fallback for any other route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </FavoritesProvider>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

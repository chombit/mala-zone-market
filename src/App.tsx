import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainSite from './MainSite'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
<<<<<<< HEAD
import ListingDetailsPage from './components/pages/ListingDetailsPage'
import { FavoritesProvider } from './contexts/FavoritesContext'
=======
import SignIn from './components/SignIn'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
>>>>>>> 06971f4a37eaa4e9350894baa5697702adcb0db6

import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'

// Auth Guard using the auth context
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

function AppContent() {
  return (
    <Router>
      <FavoritesProvider>
        <Routes>
          {/* Public Client-Facing Marketplace */}
          <Route path="/" element={<MainSite />} />

<<<<<<< HEAD
  {/* Listing Details Page */ }
  <Route path="/listing/:id" element={<ListingDetailsPage />} />
=======
        {/* Sign In/Sign Up */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
>>>>>>> 06971f4a37eaa4e9350894baa5697702adcb0db6

  {/* Admin Login Portal */ }
  <Route path="/admin/login" element={<AdminLogin />} />

  {/* Admin Dashboard - Protected */ }
  <Route
    path="/admin/*"
    element={
      <ProtectedAdminRoute>
        <AdminPanel />
      </ProtectedAdminRoute>
    }
  />

  {/* Fallback for any other route */ }
  <Route path="*" element={<Navigate to="/" />} />
      </Routes >
      </FavoritesProvider >
    </Router >
  )
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

export default App

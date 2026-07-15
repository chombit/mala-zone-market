import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainSite from './MainSite'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import ListingDetailsPage from './components/pages/ListingDetailsPage'
import { FavoritesProvider } from './contexts/FavoritesContext'

import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'

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

        {/* Listing Details Page */}
        <Route path="/listing/:id" element={<ListingDetailsPage />} />

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
  )
}

function App() {
  return (
    <AdminAuthProvider>
      <AppContent />
    </AdminAuthProvider>
  );
}

export default App

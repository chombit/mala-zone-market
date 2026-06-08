import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainSite from './MainSite'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'

// Simple Auth Guard
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = localStorage.getItem("malazone_admin_token") === "ceo_active_session";
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Client-Facing Marketplace */}
        <Route path="/" element={<MainSite />} />

        {/* Admin Login Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* CEO Dashboard - Protected */}
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
    </Router>
  )
}

export default App

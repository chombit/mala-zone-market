/**
 * ProtectedAgentRoute.tsx
 * Malazone.com — Protected Route Wrapper for Agent Pages
 * Ensures only authenticated agents can access agent-specific pages
 * © 2026 Malazone Technologies PLC
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAgentAuth } from '../contexts/AgentAuthContext';

interface ProtectedAgentRouteProps {
  children: React.ReactNode;
}

const ProtectedAgentRoute: React.FC<ProtectedAgentRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAgentAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A86B]"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/agent/login" replace />;
};

export default ProtectedAgentRoute;

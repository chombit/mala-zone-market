/**
 * ProtectedAgentRoute.tsx
 * Malazone.com — Protected Route Wrapper for Agent Pages
 * Ensures only authenticated, active agents can access agent-specific pages
 * © 2026 Malazone Technologies PLC
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { AlertCircle } from 'lucide-react';

interface ProtectedAgentRouteProps {
  children: React.ReactNode;
}

const ProtectedAgentRoute: React.FC<ProtectedAgentRouteProps> = ({ children }) => {
  const { agent, isAuthenticated, loading } = useAgentAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A86B]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !agent) {
    return <Navigate to="/agent/login" replace />;
  }

  if (agent.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Account Pending Review</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Your account is under review. A Malazone coordinator will contact you shortly to activate your account.
          </p>
          <a
            href="/agent/login"
            className="inline-block px-6 py-2.5 bg-[#00A86B] text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  if (agent.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Account Suspended</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Your account has been suspended. Please contact Malazone support for more information.
          </p>
          <a
            href="/agent/login"
            className="inline-block px-6 py-2.5 bg-[#00A86B] text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAgentRoute;

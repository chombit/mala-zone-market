/**
 * AgentAuthContext.tsx
 * Malazone.com — Agent Authentication Context
 * Cookie-based session authentication for Mala-Agents
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Agent {
  id: number;
  user_id: number;
  full_name: string;
  phone_number: string;
  sub_city: string;
  status: 'pending' | 'active' | 'suspended';
  earnings_total_etb: number;
  created_at: string;
}

interface AgentAuthContextType {
  agent: Agent | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAgent: () => Promise<void>;
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined);

export const useAgentAuth = () => {
  const context = useContext(AgentAuthContext);
  if (context === undefined) {
    throw new Error('useAgentAuth must be used within an AgentAuthProvider');
  }
  return context;
};

interface AgentAuthProviderProps {
  children: ReactNode;
}

export const AgentAuthProvider: React.FC<AgentAuthProviderProps> = ({ children }) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing agent session on mount (cookie-based)
  useEffect(() => {
    const checkAgentSession = async () => {
      try {
        const response = await fetch('/api/agents/me', { credentials: 'include' });
        const data = await response.json();
        if (data.success && data.data) {
          setAgent(data.data);
        }
      } catch (error) {
        // No valid session — that's fine
      } finally {
        setLoading(false);
      }
    };

    checkAgentSession();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const response = await fetch('/api/agents/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: cleanPhone, password }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        setAgent(data.data);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Agent login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/agents/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // Logout even if server call fails
    }
    setAgent(null);
  };

  const refreshAgent = async () => {
    try {
      const response = await fetch('/api/agents/me', { credentials: 'include' });
      const data = await response.json();
      if (data.success && data.data) {
        setAgent(data.data);
      }
    } catch (error) {
      console.error('Failed to refresh agent data:', error);
    }
  };

  return (
    <AgentAuthContext.Provider
      value={{
        agent,
        isAuthenticated: !!agent,
        loading,
        login,
        logout,
        refreshAgent,
      }}
    >
      {children}
    </AgentAuthContext.Provider>
  );
};

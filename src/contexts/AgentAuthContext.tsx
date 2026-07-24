/**
 * AgentAuthContext.tsx
 * Malazone.com — Agent Authentication Context
 * Phone-based authentication for Mala-Agents
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
  login: (phone: string) => Promise<void>;
  logout: () => void;
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

  // Check for existing agent session on mount
  useEffect(() => {
    const checkAgentSession = async () => {
      const storedPhone = localStorage.getItem('agent_phone');
      if (storedPhone) {
        try {
          const response = await fetch(`/api/agents/${storedPhone}`);
          const data = await response.json();
          if (data.success && data.data) {
            setAgent(data.data);
          } else {
            localStorage.removeItem('agent_phone');
          }
        } catch (error) {
          console.error('Failed to check agent session:', error);
          localStorage.removeItem('agent_phone');
        }
      }
      setLoading(false);
    };

    checkAgentSession();
  }, []);

  const login = async (phone: string) => {
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const response = await fetch(`/api/agents/${cleanPhone}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setAgent(data.data);
        localStorage.setItem('agent_phone', cleanPhone);
      } else {
        throw new Error(data.message || 'Agent not found');
      }
    } catch (error) {
      console.error('Agent login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setAgent(null);
    localStorage.removeItem('agent_phone');
  };

  const refreshAgent = async () => {
    if (agent?.phone_number) {
      try {
        const response = await fetch(`/api/agents/${agent.phone_number}`);
        const data = await response.json();
        if (data.success && data.data) {
          setAgent(data.data);
        }
      } catch (error) {
        console.error('Failed to refresh agent data:', error);
      }
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

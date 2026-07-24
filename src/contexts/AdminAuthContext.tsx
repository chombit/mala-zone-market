/**
 * AdminAuthContext.tsx
 * Malazone.com — Admin Role Management (Super Admin / Admin)
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export type AdminRole = "super_admin" | "admin" | "g2b_municipality" | "g2b_transport";

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  role: AdminRole;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/me", {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const result = await response.json();
      setUser(result.success ? result.user : null);
    } catch (err) {
      console.error("[Admin Auth Refresh Error]", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }

      setUser(null);
      return false;
    } catch (err) {
      console.error("[Admin Login Error]", err);
      setUser(null);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("[Admin Logout Error]", err);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === "super_admin",
        loading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

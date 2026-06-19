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

interface AdminUserWithPassword extends AdminUser {
  password?: string;
}

// Initial admin users data (stored in localStorage for persistence)
const INITIAL_ADMIN_USERS: AdminUserWithPassword[] = [
  {
    id: 1,
    username: "superadmin",
    role: "super_admin",
    full_name: "System Super Admin",
    password: "superadmin123"
  },
  {
    id: 2,
    username: "admin",
    role: "admin",
    full_name: "System Admin",
    password: "admin"
  },
  {
    id: 3,
    username: "muni_officer",
    role: "g2b_municipality",
    full_name: "Municipality Clerk Seat 02",
    password: "g2b"
  },
  {
    id: 4,
    username: "trans_officer",
    role: "g2b_transport",
    full_name: "Transit Officer Seat 09",
    password: "g2b"
  }
];

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  // User management functions for super admin (local fallback only)
  adminUsers: AdminUser[];
  addAdminUser: (user: any) => void;
  updateAdminUser: (id: number, userData: any) => void;
  deleteAdminUser: (id: number) => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserWithPassword[]>(() => {
    // Load from localStorage or use initial data
    const savedUsers = localStorage.getItem("malazone_admin_users");
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch {
        return INITIAL_ADMIN_USERS;
      }
    }
    return INITIAL_ADMIN_USERS;
  });

  // Check localStorage on mount for current user
  useEffect(() => {
    const storedUser = localStorage.getItem("malazone_admin_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("malazone_admin_token");
        localStorage.removeItem("malazone_admin_user");
      }
    }
  }, []);

  // Save admin users to localStorage when they change
  useEffect(() => {
    localStorage.setItem("malazone_admin_users", JSON.stringify(adminUsers));
  }, [adminUsers]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error("API response not ok, falling back to local users");
      }

      const result = await response.json();
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem("malazone_admin_token", "active_session");
        localStorage.setItem("malazone_admin_user", JSON.stringify(result.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      // Fallback to local storage mode if API unavailable
      const localUsers = JSON.parse(localStorage.getItem("malazone_admin_users") || JSON.stringify(INITIAL_ADMIN_USERS));
      
      let adminUser = localUsers.find((u: any) => u.username === username && u.password === password);
      if (!adminUser) {
        adminUser = INITIAL_ADMIN_USERS.find((u: any) => u.username === username && u.password === password);
      }
      
      if (adminUser) {
        const safeUser = { 
          id: adminUser.id, 
          username: adminUser.username, 
          role: adminUser.role, 
          full_name: adminUser.full_name || adminUser.name 
        };
        setUser(safeUser);
        localStorage.setItem("malazone_admin_token", "active_session");
        localStorage.setItem("malazone_admin_user", JSON.stringify(safeUser));
        return true;
      }
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("malazone_admin_token");
    localStorage.removeItem("malazone_admin_user");
  }, []);

  const addAdminUser = useCallback((userData: any) => {
    const newId = Math.max(...adminUsers.map((u: any) => u.id), 0) + 1;
    setAdminUsers((prev: any) => [...prev, { ...userData, id: newId }]);
  }, [adminUsers]);

  const updateAdminUser = useCallback((id: number, userData: any) => {
    setAdminUsers((prev: any) => prev.map((u: any) => u.id === id ? { ...u, ...userData } : u));
  }, []);

  const deleteAdminUser = useCallback((id: number) => {
    setAdminUsers((prev: any) => prev.filter((u: any) => u.id !== id));
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === "super_admin",
        login,
        logout,
        adminUsers: adminUsers.map(({ password, ...rest }) => rest), // Expose without password
        addAdminUser,
        updateAdminUser,
        deleteAdminUser
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

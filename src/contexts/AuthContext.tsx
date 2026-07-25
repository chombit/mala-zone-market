/**
 * AuthContext.tsx
 * Malazone.com — User Authentication Context
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export interface User {
  id: number;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  account_type: string;
  provider: string;
  preferred_language: "am" | "en";
  is_verified: boolean;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; message_am?: string }>;
  register: (data: { full_name: string; email: string; password: string; phone_number?: string; account_type?: string }) => Promise<{ success: boolean; message: string; message_am?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { full_name: string; phone_number?: string; email?: string }) => Promise<{ success: boolean; message: string }>;
  changePassword: (data: { current_password: string; new_password: string }) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing auth on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/me", {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("[Auth Refresh Error]", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }

      return {
        success: data.success,
        message: data.message,
        message_am: data.message_am
      };
    } catch (err) {
      console.error("[Auth Login Error]", err);
      return {
        success: false,
        message: "An error occurred during login",
        message_am: "በምግባት ወቅት ስህተት ተከስቷል"
      };
    }
  }, []);

  const register = useCallback(async (data: { full_name: string; email: string; password: string; phone_number?: string; account_type?: string }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
      }

      return {
        success: result.success,
        message: result.message,
        message_am: result.message_am
      };
    } catch (err) {
      console.error("[Auth Register Error]", err);
      return {
        success: false,
        message: "An error occurred during registration",
        message_am: "በመመዝገብ ወቅት ስህተት ተከስቷል"
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("[Auth Logout Error]", err);
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: { full_name: string; phone_number?: string; email?: string }) => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      const result = await response.json();
      if (result.success && result.user) {
        setUser(result.user);
      }
      return { success: result.success, message: result.message };
    } catch (err) {
      console.error("[Auth UpdateProfile Error]", err);
      return { success: false, message: "An error occurred" };
    }
  }, []);

  const changePassword = useCallback(async (data: { current_password: string; new_password: string }) => {
    try {
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      const result = await response.json();
      return { success: result.success, message: result.message };
    } catch (err) {
      console.error("[Auth ChangePassword Error]", err);
      return { success: false, message: "An error occurred" };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


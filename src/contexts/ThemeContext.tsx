/**
 * ThemeContext.tsx
 * Malazone.com — Dual-Theme Matrix Toggle Engine Provider
 * Manages 'light' | 'dark' state, reads system preference on mount,
 * persists to localStorage, and injects the 'dark' class on <html>.
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

/* ────────────────────────────────────────────
   Context
   ──────────────────────────────────────────── */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
const STORAGE_KEY = "malazone_theme_v2";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  // 1. Check persisted user preference
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;

  // 2. Fallback: read OS / browser system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyThemeToDOM(theme: Theme) {
  const root = window.document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

/* ────────────────────────────────────────────
   Provider
   ──────────────────────────────────────────── */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme class to <html> on every state change
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Listen for OS-level theme changes (e.g. user changes system settings)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-switch if the user hasn't manually set a preference yet
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, isDark: theme === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/* ────────────────────────────────────────────
   Failproof Hook
   ──────────────────────────────────────────── */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "useTheme must be used within a <ThemeProvider>. " +
        "Wrap your application root in <ThemeProvider> inside main.tsx."
    );
  }
  return context;
};

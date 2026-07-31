/**
 * ThemeContext.tsx
 * Malazone.com — Enforced Light Theme Provider
 * © 2026 Malazone Technologies PLC
 */

import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";

export type Theme = "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeToDOM() {
  if (typeof window === "undefined") return;
  const root = window.document.documentElement;
  root.classList.remove("dark");
  root.setAttribute("data-theme", "light");
  localStorage.setItem("malazone_theme_v2", "light");
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    applyThemeToDOM();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: "light",
        toggleTheme: () => {},
        setTheme: () => {},
        isDark: false,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: "light",
      toggleTheme: () => {},
      setTheme: () => {},
      isDark: false,
    };
  }
  return context;
};

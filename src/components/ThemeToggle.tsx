/**
 * ThemeToggle.tsx
 * Malazone.com — Elite Theme Switcher with Smooth Micro-Interactions
 * Sun (Light Mode) ↔ Moon (Dark Mode) toggle button
 * Mounts inside Header's right control cluster.
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Light Mode" : "Dark Mode"}
      className={`
        relative flex items-center justify-center
        w-10 h-10 rounded-full
        border transition-all duration-300
        overflow-hidden group
        ${isDark
          ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30"
          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
        }
        ${className}
      `}
    >
      {/* Sun icon — visible in dark mode; click = switch to light */}
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          transition-all duration-500
          ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}
        `}
      >
        <Sun className="w-4 h-4 text-amber-400" />
      </span>

      {/* Moon icon — visible in light mode; click = switch to dark */}
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          transition-all duration-500
          ${!isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}
        `}
      >
        <Moon className="w-4 h-4 text-malazone-navy" />
      </span>

      {/* Ripple glow on hover */}
      <span
        className={`
          absolute inset-0 rounded-full scale-0 group-hover:scale-100
          transition-transform duration-500 opacity-10
          ${isDark ? "bg-amber-400" : "bg-slate-500"}
        `}
      />
    </button>
  );
};

export default ThemeToggle;

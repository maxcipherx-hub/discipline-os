// ============================================
// COMPONENTS / UI / THEMETOGGLE.JSX
// ============================================

import React from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = ({ theme, onToggle, className = "" }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg border border-border-DEFAULT bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-border-DEFAULT transition-all ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

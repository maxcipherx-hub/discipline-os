// ============================================
// COMPONENTS / UI / BUTTON.JSX
// ============================================

import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-surface disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-discipline-blue text-white hover:bg-blue-600 focus:ring-blue-500",
    secondary:
      "bg-bg-surface border border-border-DEFAULT text-text-primary hover:bg-border-DEFAULT focus:ring-border-subtle",
    danger:
      "bg-discipline-red text-white hover:bg-red-600 focus:ring-red-500",
    ghost:
      "text-text-secondary hover:text-text-primary hover:bg-bg-surface/50 focus:ring-border-subtle",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

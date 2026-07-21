// ============================================
// COMPONENTS / UI / CARD.JSX
// ============================================

import React from "react";

export const Card = ({
  children,
  className = "",
  padding = "p-5",
  variant = "default",
  ...props
}) => {
  const baseStyles =
    "bg-bg-surface rounded-xl border border-border-DEFAULT transition-all";

  const variants = {
    default: "shadow-sm",
    elevated: "shadow-lg border-border-subtle",
    glass: "bg-bg-surface/80 backdrop-blur-sm border-border-subtle/50",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-3 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-text-primary ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-text-secondary ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 pt-4 border-t border-border-DEFAULT ${className}`}>
    {children}
  </div>
);

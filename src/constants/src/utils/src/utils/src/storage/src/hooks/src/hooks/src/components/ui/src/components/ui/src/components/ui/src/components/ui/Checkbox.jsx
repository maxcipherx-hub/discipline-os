// ============================================
// COMPONENTS / UI / CHECKBOX.JSX
// ============================================

import React from "react";

export const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  id,
}) => {
  const idGen = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type="checkbox"
        id={idGen}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 rounded border-border-DEFAULT bg-bg-surface text-discipline-blue focus:ring-2 focus:ring-discipline-blue/50 focus:ring-offset-2 focus:ring-offset-bg-surface transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {label && (
        <label
          htmlFor={idGen}
          className="text-text-primary cursor-pointer select-none text-base"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export const CheckboxGroup = ({ children, className = "" }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

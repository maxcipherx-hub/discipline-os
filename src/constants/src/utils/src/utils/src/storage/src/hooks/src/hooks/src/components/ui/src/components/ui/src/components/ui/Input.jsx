// ============================================
// COMPONENTS / UI / INPUT.JSX
// ============================================

import React from "react";

export const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  error = false,
  className = "",
  min,
  max,
  step,
  helperText,
  ...props
}) => {
  const baseStyles =
    "w-full bg-bg-surface border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-discipline-blue/50 focus:border-discipline-blue disabled:opacity-50 disabled:cursor-not-allowed";

  const errorStyles = error
    ? "border-discipline-red focus:ring-discipline-red/50 focus:border-discipline-red"
    : "border-border-DEFAULT";

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${baseStyles} ${errorStyles}`}
        {...props}
      />
      {helperText && (
        <p className={`mt-1 text-sm ${error ? "text-discipline-red" : "text-text-muted"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export const StepperInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  disabled = false,
  className = "",
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-DEFAULT bg-bg-surface text-text-primary hover:bg-border-DEFAULT disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
        <span className="w-16 text-center text-xl font-semibold text-text-primary">
          {value}
        </span>
        <button
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-DEFAULT bg-bg-surface text-text-primary hover:bg-border-DEFAULT disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
};

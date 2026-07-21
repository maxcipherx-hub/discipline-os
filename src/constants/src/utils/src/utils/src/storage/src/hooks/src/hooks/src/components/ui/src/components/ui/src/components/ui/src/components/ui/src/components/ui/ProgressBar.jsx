// ============================================
// COMPONENTS / UI / PROGRESSBAR.JSX
// ============================================

import React from "react";

export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showLabel = false,
  color = "bg-discipline-blue",
  height = "h-2.5",
  className = "",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={className}>
      {(label || showLabel) && (
        <div className="flex justify-between text-sm text-text-secondary mb-1">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-bg-surface rounded-full overflow-hidden border border-border-DEFAULT ${height}`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 60,
  strokeWidth = 6,
  color = "#3B82F6",
  children,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#21262D"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-text-primary font-semibold text-sm">
        {children || Math.round(percentage)}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS / ACHIEVEMENTMODAL.JSX
// ============================================

import React from "react";
import { Button } from "./ui/Button";
import { Award } from "lucide-react";

export const AchievementModal = ({
  isOpen,
  achievement,
  onClose,
}) => {
  if (!isOpen || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="bg-bg-surface rounded-2xl border border-border-subtle max-w-md w-full p-8 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-discipline-blue/20 border-2 border-discipline-blue/50 flex items-center justify-center mb-4">
            <Award size={48} className="text-discipline-blue" />
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-1">
            Achievement Unlocked!
          </h2>
          <p className="text-lg font-semibold text-discipline-blue mb-3">
            {achievement.label}
          </p>

          <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-xs">
            {achievement.message || "Your discipline is building something extraordinary."}
          </p>

          <Button onClick={onClose} variant="primary" fullWidth>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS / EMERGENCYMODAL.JSX
// ============================================

import React, { useState } from "react";
import { Button } from "./ui/Button";
import { X } from "lucide-react";

export const EmergencyModal = ({
  isOpen,
  onClose,
  onReady,
  messages,
}) => {
  const [selectedMode, setSelectedMode] = useState(null);

  if (!isOpen) return null;

  const modes = [
    { key: "gentle", label: "Gentle Push", color: "text-discipline-blue", borderColor: "border-discipline-blue/30" },
    { key: "hard", label: "Hard Truth", color: "text-discipline-amber", borderColor: "border-discipline-amber/30" },
    { key: "war", label: "War Mode", color: "text-discipline-red", borderColor: "border-discipline-red/30" },
  ];

  const handleSelectMode = (key) => {
    setSelectedMode(key);
  };

  const handleReady = () => {
    onReady && onReady(selectedMode);
    setSelectedMode(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedMode(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="bg-bg-surface rounded-2xl border border-border-subtle max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">I DON'T FEEL LIKE STUDYING</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-border-DEFAULT transition-all text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {!selectedMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => handleSelectMode(mode.key)}
                className={`p-6 rounded-xl border-2 ${mode.borderColor} bg-bg-surface/50 hover:bg-bg-surface transition-all text-left`}
              >
                <h3 className={`text-lg font-bold ${mode.color} mb-2`}>{mode.label}</h3>
                <p className="text-text-secondary text-sm">
                  {mode.key === "gentle" && "A calm reminder to begin."}
                  {mode.key === "hard" && "An honest confrontation with procrastination."}
                  {mode.key === "war" && "Maximum intensity. Break the cycle."}
                </p>
              </button>
            ))}
          </div>
        )}

        {selectedMode && messages && messages[selectedMode] && (
          <div className="mt-4 animate-fade-in">
            <div className="bg-bg-surface/50 rounded-xl border border-border-DEFAULT p-6 max-h-[50vh] overflow-y-auto">
              <h3 className={`text-xl font-bold ${messages[selectedMode].color || "text-text-primary"} mb-3`}>
                {messages[selectedMode].title}
              </h3>
              <div className="text-text-secondary whitespace-pre-wrap text-base leading-relaxed">
                {messages[selectedMode].content}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={handleReady} variant="primary" fullWidth>
                I'M READY TO STUDY
              </Button>
              <Button
                onClick={() => setSelectedMode(null)}
                variant="ghost"
                fullWidth
              >
                Back to Modes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

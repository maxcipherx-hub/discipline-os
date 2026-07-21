// ============================================
// PAGES / HOME.JSX — EXECUTION ZONE
// ============================================

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  StepperInput,
  Checkbox,
  CheckboxGroup,
  ProgressBar,
} from "../components/ui";
import { useDiscipline } from "../hooks/useDiscipline";
import { useAI } from "../hooks/useAI";
import { getMonkScoreDetails } from "../utils/mathUtils";
import { getFormattedDate, getCurrentChallengeDay, isSunday } from "../utils/dateUtils";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";

export const HomePage = ({ setEmergencyOpen }) => {
  const {
    loading,
    saveToday,
    getComputedStats,
    getTodayInputDefaults,
    isTodayLocked,
    isChallengeActive,
    isInfinite,
    currentDay,
  } = useDiscipline();

  const { generateInsights, dailyInsight } = useAI();

  const [formData, setFormData] = useState({
    studyHours: "",
    deepWorkSessions: "",
    mockTestScore: "",
    protocols: { deepWork: false, planning: false, dopamineControl: false, skillDevelopment: false },
    selfCare: { hairCare: false, skinCare: false, eyeCare: false },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [todayIsSunday, setTodayIsSunday] = useState(false);

  const stats = getComputedStats();
  const defaults = getTodayInputDefaults();
  const monkDetails = stats?.todayMonkScore !== undefined ? getMonkScoreDetails(stats.todayMonkScore) : null;

  useEffect(() => {
    if (defaults) {
      setFormData({
        studyHours: defaults.studyHours,
        deepWorkSessions: defaults.deepWorkSessions,
        mockTestScore: defaults.mockTestScore,
        protocols: defaults.protocols || { deepWork: false, planning: false, dopamineControl: false, skillDevelopment: false },
        selfCare: defaults.selfCare || { hairCare: false, skinCare: false, eyeCare: false },
      });
      setTodayIsSunday(defaults.isSunday || false);
    }
  }, [defaults]);

  useEffect(() => {
    if (stats) {
      generateInsights(stats.dailyLogs, stats.todayMonkScore, currentDay);
    }
  }, [stats, generateInsights, currentDay]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProtocolChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      protocols: { ...prev.protocols, [key]: value },
    }));
  };

  const handleSelfCareChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      selfCare: { ...prev.selfCare, [key]: value },
    }));
  };

  const handleSave = () => {
    const payload = {
      studyHours: parseFloat(formData.studyHours) || 0,
      deepWorkSessions: parseInt(formData.deepWorkSessions) || 0,
      mockTestScore: formData.mockTestScore ? parseFloat(formData.mockTestScore) : null,
      protocols: formData.protocols,
      selfCare: formData.selfCare,
    };

    const result = saveToday(payload);
    if (result.success) {
      setShowSuccess(true);
      setSaveMessage("Day Saved Successfully. Another disciplined day completed.");
      setTimeout(() => setShowSuccess(false), 4000);
    } else {
      setSaveMessage(result.message || "Error saving day.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-text-secondary">Loading DisciplineOS...</div>
      </div>
    );
  }

  if (!isChallengeActive && currentDay === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-2">DisciplineOS</h1>
        <p className="text-text-secondary text-lg mb-1">Build Discipline. Results Will Follow.</p>
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-8 mt-6 max-w-md">
          <p className="text-text-secondary">Challenge starts on</p>
          <p className="text-2xl font-bold text-text-primary mt-1">22 July 2026</p>
          <p className="text-text-muted text-sm mt-4">Prepare yourself. Your 200-day journey begins soon.</p>
        </div>
      </div>
    );
  }

  const dayDisplay = isInfinite ? "INFINITE MODE" : `${Math.min(currentDay, 200)} / 200`;

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-secondary text-sm">
            {getFormattedDate(new Date())}
          </p>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            DAY {dayDisplay}
            {isTodayLocked && (
              <span className="text-xs bg-discipline-blue/20 text-discipline-blue px-2 py-1 rounded-full font-normal flex items-center gap-1">
                <Lock size={12} /> Locked
              </span>
            )}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">Rank</p>
          <p className="text-xl font-bold text-discipline-blue">{stats?.currentRank?.label || "E"}</p>
        </div>
      </div>

      <Card variant="elevated">
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-text-secondary">Today's Monk Score</p>
              <p className="text-3xl font-bold text-text-primary">
                {isTodayLocked ? stats?.todayMonkScore ?? 0 : "--"}
              </p>
              {monkDetails && isTodayLocked && (
                <p className={`text-sm font-medium text-discipline-${monkDetails.color}`}>
                  {monkDetails.label}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-text-secondary text-right">Total XP</p>
              <p className="text-2xl font-bold text-text-primary">{stats?.totalXP || 0}</p>
            </div>
          </div>
          <ProgressBar
            value={stats?.progressToNextRank?.progress || 0}
            max={100}
            label={`${stats?.currentRank?.label || "E"} → ${stats?.progressToNextRank?.rank || "MAX"}`}
            showLabel
          />
        </CardContent>
      </Card>

      {dailyInsight && (
        <div className="bg-bg-surface/50 border border-border-DEFAULT rounded-xl px-4 py-3">
          <p className="text-sm text-text-secondary italic">🧠 {dailyInsight}</p>
        </div>
      )}

      {!isTodayLocked && isChallengeActive ? (
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4">
              <StepperInput
                label="Deep Work Sessions (Max 4)"
                value={parseInt(formData.deepWorkSessions) || 0}
                onChange={(val) => handleInputChange("deepWorkSessions", val)}
                min={0}
                max={4}
                step={1}
              />
              <Input
                label="Study Hours (Max 10 counted)"
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={formData.studyHours}
                onChange={(e) => handleInputChange("studyHours", e.target.value)}
                placeholder="e.g. 6.5"
                helperText={formData.studyHours > 10 ? "Values above 10 are recorded but not scored." : ""}
              />
              {todayIsSunday && (
                <Input
                  label="Sunday Mock Test Score (%)"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.mockTestScore}
                  onChange={(e) => handleInputChange("mockTestScore", e.target.value)}
                  placeholder="0-100"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discipline Protocols</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckboxGroup>
                <Checkbox
                  label="Deep Work Completed"
                  checked={formData.protocols.deepWork}
                  onChange={(v) => handleProtocolChange("deepWork", v)}
                />
                <Checkbox
                  label="Daily Planning Completed"
                  checked={formData.protocols.planning}
                  onChange={(v) => handleProtocolChange("planning", v)}
                />
                <Checkbox
                  label="Dopamine Control"
                  checked={formData.protocols.dopamineControl}
                  onChange={(v) => handleProtocolChange("dopamineControl", v)}
                />
                <Checkbox
                  label="Skill Development"
                  checked={formData.protocols.skillDevelopment}
                  onChange={(v) => handleProtocolChange("skillDevelopment", v)}
                />
              </CheckboxGroup>
            </CardContent>
          </Card>

          <details className="group">
            <summary className="cursor-pointer text-text-secondary hover:text-text-primary transition-all text-sm font-medium list-none flex items-center gap-2">
              <span className="inline-block transition-transform group-open:rotate-90">▶</span>
              Optional Self Care
            </summary>
            <div className="mt-3 pl-4 space-y-2">
              <Checkbox
                label="Hair Care"
                checked={formData.selfCare.hairCare}
                onChange={(v) => handleSelfCareChange("hairCare", v)}
              />
              <Checkbox
                label="Skin Care"
                checked={formData.selfCare.skinCare}
                onChange={(v) => handleSelfCareChange("skinCare", v)}
              />
              <Checkbox
                label="Eye Care"
                checked={formData.selfCare.eyeCare}
                onChange={(v) => handleSelfCareChange("eyeCare", v)}
              />
            </div>
          </details>

          <Button onClick={handleSave} variant="primary" fullWidth size="lg">
            SAVE TODAY
          </Button>

          {saveMessage && (
            <div className={`flex items-center gap-2 text-sm ${saveMessage.includes("Error") ? "text-discipline-red" : "text-discipline-emerald"}`}>
              {saveMessage.includes("Error") ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              {saveMessage}
            </div>
          )}
        </div>
      ) : (
        <Card variant="glass">
          <CardContent className="text-center py-6 space-y-2">
            <CheckCircle size={48} className="mx-auto text-discipline-emerald" />
            <h3 className="text-xl font-bold text-text-primary">Excellent.</h3>
            <p className="text-text-secondary">Today's work is finished. Return tomorrow.</p>
            <div className="text-sm text-text-muted border-t border-border-DEFAULT pt-3 mt-3">
              <p>Study: {defaults?.studyHours || 0}h | Deep: {defaults?.deepWorkSessions || 0}</p>
              <p>Monk Score: {stats?.todayMonkScore || 0} | XP: {stats?.totalXP || 0}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

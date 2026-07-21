// ============================================
// PAGES / DETAILS.JSX — ANALYTICS ZONE
// ============================================

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from "../components/ui";
import { Heatmap } from "../components/Heatmap";
import { useDiscipline } from "../hooks/useDiscipline";
import { useAI } from "../hooks/useAI";
import { SUBJECTS, CHALLENGE_START_DATE } from "../constants";

export const DetailsPage = () => {
  const { getComputedStats, currentDay } = useDiscipline();
  const { generateInsights, weeklyInsight, monthlyInsight, patterns } = useAI();
  const stats = getComputedStats();

  useEffect(() => {
    if (stats) {
      generateInsights(stats.dailyLogs, stats.todayMonkScore, currentDay);
    }
  }, [stats, generateInsights, currentDay]);

  if (!stats) return <div className="text-text-secondary">Loading analytics...</div>;

  const logs = stats.dailyLogs || [];
  const subjects = stats.subjectProgress || {};

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-text-muted">Total XP</p>
            <p className="text-xl font-bold text-text-primary">{stats.totalXP}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Avg Monk</p>
            <p className="text-xl font-bold text-text-primary">{stats.avgMonkScore}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Streak</p>
            <p className="text-xl font-bold text-text-primary">{stats.streakCount} days</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Consistency</p>
            <p className="text-xl font-bold text-text-primary">{stats.consistencyPercent}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>200-Day Discipline Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap
            logs={logs}
            startDate={CHALLENGE_START_DATE}
            onDayClick={(day) => console.log("Clicked:", day)}
          />
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-discipline-red rounded-sm"></span> Poor</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-discipline-amber rounded-sm"></span> Avg</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-discipline-cyan rounded-sm"></span> Good</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-discipline-blue rounded-sm"></span> Strong</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-discipline-emerald rounded-sm"></span> Elite</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-discipline-purple rounded-sm"></span> Recovery</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject Mastery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(SUBJECTS).map(([key, sub]) => {
            const progress = subjects[key] || { completedChapters: 0, totalChapters: sub.totalChapters };
            const pct = Math.round((progress.completedChapters / sub.totalChapters) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary">{sub.icon} {sub.label}</span>
                  <span className="text-text-secondary">{progress.completedChapters}/{sub.totalChapters}</span>
                </div>
                <ProgressBar value={pct} max={100} color={pct > 70 ? "bg-discipline-blue" : "bg-discipline-amber"} height="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weeklyInsight && (
            <div className="border border-border-DEFAULT rounded-lg p-3">
              <p className="text-xs text-text-muted uppercase tracking-wider">Weekly Report</p>
              <p className="text-text-primary text-sm">{weeklyInsight.summary}</p>
              {weeklyInsight.suggestions?.map((s, i) => (
                <li key={i} className="text-text-secondary text-sm list-disc list-inside">{s}</li>
              ))}
            </div>
          )}
          {monthlyInsight && (
            <div className="border border-border-DEFAULT rounded-lg p-3">
              <p className="text-xs text-text-muted uppercase tracking-wider">Monthly Report</p>
              <p className="text-text-primary text-sm">{monthlyInsight.summary}</p>
            </div>
          )}
          {patterns && patterns.length > 0 && (
            <div className="border border-discipline-amber/30 bg-discipline-amber/5 rounded-lg p-3">
              <p className="text-xs text-discipline-amber uppercase tracking-wider">Patterns Detected</p>
              {patterns.map((p, i) => (
                <p key={i} className="text-sm text-text-secondary">• {p}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// COMPONENTS / HEATMAP.JSX
// ============================================

import React from "react";
import { getHeatmapColorClass } from "../utils/mathUtils";
import { CHALLENGE_DURATION_DAYS } from "../constants";

export const Heatmap = ({ logs = [], startDate, onDayClick }) => {
  const days = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < CHALLENGE_DURATION_DAYS; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateISO = date.toISOString().split("T")[0];
    const log = logs.find((l) => l.date === dateISO);
    days.push({
      date: dateISO,
      dayNumber: i + 1,
      log: log || null,
      isCompleted: log?.isLocked || false,
      isRecovered: log?.isRecoveredDay || false,
      monkScore: log?.monkScore || 0,
    });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[700px]">
        <div className="flex text-xs text-text-muted mb-1 pl-8">
          {weeks.map((week, idx) => {
            if (idx % 4 === 0 && week.length > 0) {
              const date = new Date(week[0].date);
              return (
                <span key={idx} style={{ width: `${(week.length / 7) * 100}%` }}>
                  {date.toLocaleString("default", { month: "short" })}
                </span>
              );
            }
            return null;
          })}
        </div>

        <div className="flex gap-1">
          <div className="flex flex-col gap-1 text-[10px] text-text-muted pr-2 pt-1">
            {["Mon", "Wed", "Fri"].map((d) => (
              <div key={d} style={{ height: "18px" }}>
                {d}
              </div>
            ))}
          </div>

          <div className="flex flex-1 gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1 flex-1">
                {week.map((day, dayIdx) => {
                  let bgClass = "bg-bg-surface border border-border-DEFAULT";
                  if (day.isRecovered) {
                    bgClass = "bg-discipline-purple border-discipline-purple/30";
                  } else if (day.isCompleted) {
                    const colorClass = getHeatmapColorClass(day.monkScore, false);
                    bgClass = `${colorClass} border-transparent`;
                  } else {
                    bgClass = "bg-bg-surface border border-border-DEFAULT opacity-30";
                  }

                  return (
                    <div
                      key={dayIdx}
                      className={`w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer ${bgClass}`}
                      title={`Day ${day.dayNumber}: ${day.isCompleted ? day.monkScore : "Missed"}`}
                      onClick={() => onDayClick && onDayClick(day)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DISCIPLINEOS — SINGLE FILE APP (App.js) [PART 1/5]
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { Home, BarChart3, User, AlertTriangle, Sun, Moon, Award, Shield, Clock, Infinity, Lock, CheckCircle, AlertCircle } from "lucide-react";

// ===================== 1. CONSTANTS =====================
const CHALLENGE_START_DATE = new Date("2026-07-22T00:00:00");
const CHALLENGE_DURATION_DAYS = 200;
const MAX_STUDY_HOURS_COUNTED = 10;
const MAX_DEEP_WORK_SESSIONS = 4;
const TOTAL_RECOVERY_DAYS = 10;

const SUBJECTS = {
  physics: { label: "Physics", totalChapters: 14, icon: "⚛️" },
  chemistry: { label: "Chemistry", totalChapters: 16, icon: "🧪" },
  maths: { label: "Maths", totalChapters: 13, icon: "📐" },
  english: { label: "English", totalChapters: 21, icon: "📖" },
  urdu: { label: "Urdu", totalChapters: 39, icon: "🖋️" },
};

const RANKS = [
  { id: "E", label: "E", minXP: 0, minMonk: 0, minConsistency: 0 },
  { id: "D", label: "D", minXP: 500, minMonk: 60, minConsistency: 70 },
  { id: "C", label: "C", minXP: 1500, minMonk: 68, minConsistency: 75 },
  { id: "B", label: "B", minXP: 3500, minMonk: 75, minConsistency: 80 },
  { id: "A", label: "A", minXP: 7000, minMonk: 82, minConsistency: 85 },
  { id: "S", label: "S", minXP: 15000, minMonk: 85, minConsistency: 90, requiresDay200: true },
  { id: "LEGEND", label: "LEGEND", minXP: 15000, minMonk: 85, minConsistency: 90, requiresInfinite: true },
];

const ACHIEVEMENTS = [
  { id: "first_step", label: "First Step", condition: (s) => s.totalDaysCompleted >= 1, message: "The first day is always the hardest. You showed up." },
  { id: "seven_days_strong", label: "Seven Days Strong", condition: (s) => s.currentStreak >= 7, message: "A full week of discipline. This is where momentum begins." },
  { id: "momentum_builder", label: "Momentum Builder", condition: (s) => s.currentStreak >= 30, message: "30 days. You're no longer experimenting—you're becoming." },
  { id: "iron_discipline", label: "Iron Discipline", condition: (s) => s.currentStreak >= 60, message: "60 days. Discipline is now part of your daily identity." },
  { id: "century_mind", label: "Century Mind", condition: (s) => s.totalDaysCompleted >= 100, message: "100 days. Most people never reach this. You did." },
  { id: "unbreakable", label: "Unbreakable", condition: (s) => s.totalDaysCompleted >= 150, message: "150 days. Your consistency is now a force of nature." },
  { id: "legend", label: "Legend", condition: (s) => s.totalDaysCompleted >= 200, message: "200 days. You didn't just complete a challenge—you rewired your identity." },
  { id: "infinite_walker", label: "Infinite Walker", condition: (s) => s.infiniteModeUnlocked === true, message: "The challenge ends. Discipline continues forever." },
];

const CONSISTENCY_BONUSES = [
  { streak: 7, xp: 10 },
  { streak: 30, xp: 30 },
  { streak: 60, xp: 60 },
  { streak: 100, xp: 100 },
  { streak: 150, xp: 150 },
  { streak: 200, xp: 300 },
];

const MONK_SCORE_LEVELS = [
  { min: 95, max: 100, label: "Legendary Day", color: "emerald" },
  { min: 90, max: 94, label: "Exceptional Day", color: "blue" },
  { min: 80, max: 89, label: "Strong Day", color: "cyan" },
  { min: 70, max: 79, label: "Good Day", color: "amber" },
  { min: 60, max: 69, label: "Steady Day", color: "orange" },
  { min: 40, max: 59, label: "Needs Improvement", color: "orange" },
  { min: 0, max: 39, label: "Recovery Needed", color: "red" },
];

const XP_WEIGHTS = {
  study: { max: 40, maxHours: 10 },
  deepWork: { max: 20, maxSessions: 4, perSession: 5 },
  protocols: { max: 20, perProtocol: 5 },
  mockTest: { max: 20, thresholds: [
    { min: 0, max: 39, xp: 0 },
    { min: 40, max: 59, xp: 4 },
    { min: 60, max: 74, xp: 8 },
    { min: 75, max: 89, xp: 12 },
    { min: 90, max: 100, xp: 16 },
  ]},
};

const MONK_WEIGHTS = { study: 0.40, deepWork: 0.20, protocols: 0.20, mockTest: 0.20 };

const DEFAULT_DATA = {
  userStats: {
    currentDay: 1,
    totalXP: 0,
    currentRank: "E",
    streakCount: 0,
    bestStreak: 0,
    lastLoginDate: null,
    recoveryDaysLeft: 10,
    totalDaysCompleted: 0,
    totalStudyHours: 0,
    totalDeepWorkSessions: 0,
    infiniteModeUnlocked: false,
  },
  dailyLogs: [],
  subjectProgress: {
    physics: { totalChapters: 14, completedChapters: 0 },
    chemistry: { totalChapters: 16, completedChapters: 0 },
    maths: { totalChapters: 13, completedChapters: 0 },
    english: { totalChapters: 21, completedChapters: 0 },
    urdu: { totalChapters: 39, completedChapters: 0 },
  },
  mockTests: [],
  xpHistory: [],
  weeklyReports: [],
  monthlyReports: [],
  achievements: [],
  recoveryHistory: [],
  aiInsightHistory: [],
  settings: { theme: "dark" },
};

const createDailyLog = (dayNumber, dateISO) => ({
  date: dateISO,
  dayNumber,
  studyHours: 0,
  deepWorkSessions: 0,
  mockTestScore: null,
  protocols: { deepWork: false, planning: false, dopamineControl: false, skillDevelopment: false },
  selfCare: { hairCare: false, skinCare: false, eyeCare: false },
  monkScore: 0,
  xpEarned: 0,
  isRecoveredDay: false,
  isMissedDay: false,
  isLocked: false,
});

// ===================== 2. UTILITY FUNCTIONS =====================
const getTodayMidnight = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getChallengeStartMidnight = () => {
  return new Date(
    CHALLENGE_START_DATE.getFullYear(),
    CHALLENGE_START_DATE.getMonth(),
    CHALLENGE_START_DATE.getDate()
  );
};

const getCurrentChallengeDay = () => {
  const today = getTodayMidnight();
  const start = getChallengeStartMidnight();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0;
  if (diff >= CHALLENGE_DURATION_DAYS) return CHALLENGE_DURATION_DAYS + (diff - CHALLENGE_DURATION_DAYS) + 1;
  return diff + 1;
};

const hasChallengeStarted = () => getCurrentChallengeDay() > 0;
const isInfiniteMode = () => getCurrentChallengeDay() > CHALLENGE_DURATION_DAYS;

const getISODate = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const isSunday = (date = new Date()) => date.getDay() === 0;
const getFormattedDate = (date = new Date()) => date.toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const getMonkScoreDetails = (score) => {
  for (const l of MONK_SCORE_LEVELS) {
    if (score >= l.min && score <= l.max) return { label: l.label, color: l.color };
  }
  return { label: "Unknown", color: "gray" };
};

const calculateStudyXP = (hours) => {
  const capped = Math.min(hours, MAX_STUDY_HOURS_COUNTED);
  return Math.round((capped / MAX_STUDY_HOURS_COUNTED) * XP_WEIGHTS.study.max);
};

const calculateDeepWorkXP = (sessions) => {
  const capped = Math.min(sessions, MAX_DEEP_WORK_SESSIONS);
  return capped * XP_WEIGHTS.deepWork.perSession;
};

const calculateProtocolXP = (protocols) => {
  const count = Object.values(protocols).filter(v => v).length;
  return count * XP_WEIGHTS.protocols.perProtocol;
};

const calculateMockTestXP = (score) => {
  if (score === null || score === undefined) return 0;
  for (const t of XP_WEIGHTS.mockTest.thresholds) {
    if (score >= t.min && score <= t.max) return t.xp;
  }
  return 0;
};

const calculateMonkScore = ({ studyHours, deepWorkSessions, protocols, mockTestScore, isSunday: isSun }) => {
  const cappedStudy = Math.min(studyHours, MAX_STUDY_HOURS_COUNTED);
  const cappedDeep = Math.min(deepWorkSessions, MAX_DEEP_WORK_SESSIONS);
  const protocolCount = Object.values(protocols).filter(v => v).length;
  const protocolRatio = protocolCount / 4;
  let studyRatio = cappedStudy / MAX_STUDY_HOURS_COUNTED;
  let deepRatio = cappedDeep / MAX_DEEP_WORK_SESSIONS;
  let mockRatio = 0;
  if (isSun && mockTestScore !== null && mockTestScore !== undefined) {
    mockRatio = Math.min(mockTestScore / 100, 1);
  }
  let wStudy = MONK_WEIGHTS.study;
  let wDeep = MONK_WEIGHTS.deepWork;
  let wProtocol = MONK_WEIGHTS.protocols;
  let wMock = MONK_WEIGHTS.mockTest;
  if (!isSun || mockTestScore === null || mockTestScore === undefined) {
    const total = wStudy + wDeep + wProtocol;
    if (total > 0) {
      const scale = 1 / total;
      wStudy *= scale; wDeep *= scale; wProtocol *= scale; wMock = 0;
    } else { wStudy = 0.5; wDeep = 0.25; wProtocol = 0.25; wMock = 0; }
  }
  let score = studyRatio * wStudy * 100 + deepRatio * wDeep * 100 + protocolRatio * wProtocol * 100 + mockRatio * wMock * 100;
  return Math.round(Math.min(Math.max(score, 0), 100));
};

const calculateDailyXP = ({ studyHours, deepWorkSessions, protocols, mockTestScore, isSunday: isSun }) => {
  let total = calculateStudyXP(studyHours) + calculateDeepWorkXP(deepWorkSessions) + calculateProtocolXP(protocols);
  if (isSun) total += calculateMockTestXP(mockTestScore);
  if (!isSun || mockTestScore === null || mockTestScore === undefined) {
    const baseMax = 80;
    if (baseMax > 0) total = Math.round(total * (100 / baseMax));
  }
  return Math.min(total, 100);
};

const calculateConsistencyBonus = (streak) => {
  let bonus = 0;
  for (const b of CONSISTENCY_BONUSES) {
    if (streak >= b.streak) bonus = b.xp;
  }
  return bonus;
};

const calculateConsistency = ({ totalDaysCompleted, totalElapsedDays }) => {
  if (totalElapsedDays === 0) return 0;
  return Math.round((totalDaysCompleted / totalElapsedDays) * 100);
};

const getCurrentRank = ({ totalXP, avgMonkScore, consistencyPercent, totalDaysCompleted, infiniteModeUnlocked }) => {
  let eligible = RANKS[0];
  for (const rank of RANKS) {
    if (rank.id === "S" && totalDaysCompleted < 200) continue;
    if (rank.id === "LEGEND" && !infiniteModeUnlocked) continue;
    if (totalXP >= rank.minXP && avgMonkScore >= rank.minMonk && consistencyPercent >= rank.minConsistency) {
      eligible = rank;
    }
  }
  return eligible;
};

const getHeatmapColorClass = (monkScore, isRecovered = false) => {
  if (isRecovered) return "bg-discipline-purple";
  if (monkScore >= 95) return "bg-discipline-emerald";
  if (monkScore >= 80) return "bg-discipline-blue";
  if (monkScore >= 65) return "bg-discipline-cyan";
  if (monkScore >= 50) return "bg-discipline-amber";
  if (monkScore >= 25) return "bg-discipline-orange";
  return "bg-discipline-red";
};

const calculateAverageMonkScore = (logs) => {
  const saved = logs.filter(l => l.isLocked && !l.isRecoveredDay);
  if (saved.length === 0) return 0;
  const sum = saved.reduce((acc, l) => acc + l.monkScore, 0);
  return Math.round(sum / saved.length);
};

const getChallengeWeekNumber = (dayNumber) => {
  if (dayNumber <= 0) return 0;
  return Math.ceil(dayNumber / 7);
};
// ============================================================
// DISCIPLINEOS — SINGLE FILE APP (App.js) [PART 2/5]
// ============================================================

// ===================== 3. STORAGE (LocalStorage) =====================
const STORAGE_KEY = "disciplineOS_data";

const deepMerge = (target, source) => {
  if (!source) return target;
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
        target[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw);
    const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), parsed);
    return merged;
  } catch (e) {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
};

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; }
};

const getTodayLog = (data) => {
  const todayISO = getISODate(new Date());
  return data.dailyLogs.find(log => log.date === todayISO);
};

const saveTodayEntry = (data, inputData) => {
  const todayISO = getISODate(new Date());
  const dayNumber = getCurrentChallengeDay();
  let log = data.dailyLogs.find(l => l.date === todayISO);
  if (!log) {
    log = createDailyLog(dayNumber, todayISO);
    data.dailyLogs.push(log);
  }
  if (log.isLocked) return { success: false, data, message: "Day is locked" };

  log.studyHours = Math.max(0, inputData.studyHours || 0);
  log.deepWorkSessions = Math.max(0, inputData.deepWorkSessions || 0);
  log.mockTestScore = inputData.mockTestScore !== undefined ? inputData.mockTestScore : null;
  log.protocols = { ...log.protocols, ...inputData.protocols };
  log.selfCare = { ...log.selfCare, ...inputData.selfCare };

  const isSun = isSunday(new Date(todayISO));
  log.monkScore = calculateMonkScore({
    studyHours: log.studyHours,
    deepWorkSessions: log.deepWorkSessions,
    protocols: log.protocols,
    mockTestScore: log.mockTestScore,
    isSunday: isSun,
  });

  const baseXP = calculateDailyXP({
    studyHours: log.studyHours,
    deepWorkSessions: log.deepWorkSessions,
    protocols: log.protocols,
    mockTestScore: log.mockTestScore,
    isSunday: isSun,
  });
  const bonusXP = calculateConsistencyBonus(data.userStats.streakCount);
  log.xpEarned = baseXP + bonusXP;
  log.isLocked = true;

  data.userStats.totalXP += log.xpEarned;
  data.userStats.totalDaysCompleted += 1;
  data.userStats.totalStudyHours += log.studyHours;
  data.userStats.totalDeepWorkSessions += log.deepWorkSessions;
  data.userStats.streakCount += 1;
  if (data.userStats.streakCount > data.userStats.bestStreak) {
    data.userStats.bestStreak = data.userStats.streakCount;
  }
  data.userStats.lastLoginDate = todayISO;

  data.xpHistory.push({
    date: todayISO,
    xpEarned: log.xpEarned,
    sourceBreakdown: { study: 0, deepWork: 0, protocols: 0, mockTest: 0, consistency: bonusXP },
    totalXPAfter: data.userStats.totalXP,
  });

  const consistency = calculateConsistency({
    totalDaysCompleted: data.userStats.totalDaysCompleted,
    totalElapsedDays: getCurrentChallengeDay(),
  });
  const avgMonk = calculateAverageMonkScore(data.dailyLogs);
  const rank = getCurrentRank({
    totalXP: data.userStats.totalXP,
    avgMonkScore: avgMonk,
    consistencyPercent: consistency,
    totalDaysCompleted: data.userStats.totalDaysCompleted,
    infiniteModeUnlocked: data.userStats.infiniteModeUnlocked || false,
  });
  data.userStats.currentRank = rank.id;

  if (getCurrentChallengeDay() > 200) {
    data.userStats.infiniteModeUnlocked = true;
  }

  saveData(data);
  return { success: true, data };
};

const applyMidnightLock = (data) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = getISODate(yesterday);
  const yesterdayLog = data.dailyLogs.find(l => l.date === yesterdayISO);
  if (yesterdayLog && !yesterdayLog.isLocked && !yesterdayLog.isMissedDay) {
    if (yesterdayLog.studyHours === 0 && !yesterdayLog.isRecoveredDay) {
      yesterdayLog.isMissedDay = true;
      yesterdayLog.isLocked = true;
    }
    yesterdayLog.isLocked = true;
    saveData(data);
  }
  return data;
};
// ============================================================
// DISCIPLINEOS — SINGLE FILE APP (App.js) [PART 3/5]
// ============================================================

// ===================== 4. UI COMPONENTS =====================
const Button = ({ children, variant = "primary", size = "md", fullWidth = false, className = "", disabled = false, onClick, ...props }) => {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-surface disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-discipline-blue text-white hover:bg-blue-600 focus:ring-blue-500",
    secondary: "bg-bg-surface border border-border-DEFAULT text-text-primary hover:bg-border-DEFAULT focus:ring-border-subtle",
    danger: "bg-discipline-red text-white hover:bg-red-600 focus:ring-red-500",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-surface/50 focus:ring-border-subtle",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-base", lg: "px-6 py-3 text-lg" };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", padding = "p-5", variant = "default", ...props }) => {
  const base = "bg-bg-surface rounded-xl border border-border-DEFAULT transition-all";
  const variants = { default: "shadow-sm", elevated: "shadow-lg border-border-subtle", glass: "bg-bg-surface/80 backdrop-blur-sm border-border-subtle/50" };
  return <div className={`${base} ${variants[variant]} ${padding} ${className}`} {...props}>{children}</div>;
};

const CardHeader = ({ children, className = "" }) => <div className={`mb-3 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold text-text-primary ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

const Input = ({ label, type = "text", value, onChange, placeholder = "", disabled = false, error = false, className = "", min, max, step, helperText, ...props }) => {
  const base = "w-full bg-bg-surface border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-discipline-blue/50 focus:border-discipline-blue disabled:opacity-50 disabled:cursor-not-allowed";
  const err = error ? "border-discipline-red focus:ring-discipline-red/50 focus:border-discipline-red" : "border-border-DEFAULT";
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} min={min} max={max} step={step} className={`${base} ${err}`} {...props} />
      {helperText && <p className={`mt-1 text-sm ${error ? "text-discipline-red" : "text-text-muted"}`}>{helperText}</p>}
    </div>
  );
};

const StepperInput = ({ label, value, onChange, min = 0, max = 10, step = 1, disabled = false, className = "" }) => {
  const dec = () => { if (value > min) onChange(Math.max(min, value - step)); };
  const inc = () => { if (value < max) onChange(Math.min(max, value + step)); };
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}
      <div className="flex items-center gap-2">
        <button onClick={dec} disabled={disabled || value <= min} className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-DEFAULT bg-bg-surface text-text-primary hover:bg-border-DEFAULT disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
        </button>
        <span className="w-16 text-center text-xl font-semibold text-text-primary">{value}</span>
        <button onClick={inc} disabled={disabled || value >= max} className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-DEFAULT bg-bg-surface text-text-primary hover:bg-border-DEFAULT disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        </button>
      </div>
    </div>
  );
};

const Checkbox = ({ label, checked = false, onChange, disabled = false, className = "", id }) => {
  const genId = id || `cb-${Math.random().toString(36).substr(2,9)}`;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input type="checkbox" id={genId} checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="w-5 h-5 rounded border-border-DEFAULT bg-bg-surface text-discipline-blue focus:ring-2 focus:ring-discipline-blue/50 focus:ring-offset-2 focus:ring-offset-bg-surface transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
      {label && <label htmlFor={genId} className="text-text-primary cursor-pointer select-none text-base">{label}</label>}
    </div>
  );
};

const CheckboxGroup = ({ children, className = "" }) => <div className={`space-y-2 ${className}`}>{children}</div>;

const ProgressBar = ({ value = 0, max = 100, label, showLabel = false, color = "bg-discipline-blue", height = "h-2.5", className = "" }) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={className}>
      {(label || showLabel) && <div className="flex justify-between text-sm text-text-secondary mb-1"><span>{label}</span><span>{Math.round(pct)}%</span></div>}
      <div className={`w-full bg-bg-surface rounded-full overflow-hidden border border-border-DEFAULT ${height}`}>
        <div className={`${color} h-full rounded-full transition-all duration-300 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const ThemeToggle = ({ theme, onToggle, className = "" }) => (
  <button onClick={onToggle} className={`p-2 rounded-lg border border-border-DEFAULT bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-border-DEFAULT transition-all ${className}`}>
    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

// ===================== 5. HEATMAP =====================
const Heatmap = ({ logs = [], startDate, onDayClick }) => {
  const days = [];
  const start = new Date(startDate);
  start.setHours(0,0,0,0);
  for (let i = 0; i < CHALLENGE_DURATION_DAYS; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateISO = date.toISOString().split("T")[0];
    const log = logs.find(l => l.date === dateISO);
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
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[700px]">
        <div className="flex text-xs text-text-muted mb-1 pl-8">
          {weeks.map((week, idx) => {
            if (idx % 4 === 0 && week.length > 0) {
              const d = new Date(week[0].date);
              return <span key={idx} style={{ width: `${(week.length / 7) * 100}%` }}>{d.toLocaleString("default", { month: "short" })}</span>;
            }
            return null;
          })}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 text-[10px] text-text-muted pr-2 pt-1">
            {["Mon", "Wed", "Fri"].map(d => <div key={d} style={{ height: "18px" }}>{d}</div>)}
          </div>
          <div className="flex flex-1 gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1 flex-1">
                {week.map((day, di) => {
                  let bg = "bg-bg-surface border border-border-DEFAULT";
                  if (day.isRecovered) bg = "bg-discipline-purple border-discipline-purple/30";
                  else if (day.isCompleted) { const c = getHeatmapColorClass(day.monkScore, false); bg = `${c} border-transparent`; }
                  else bg = "bg-bg-surface border border-border-DEFAULT opacity-30";
                  return (
                    <div key={di} className={`w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer ${bg}`}
                      title={`Day ${day.dayNumber}: ${day.isCompleted ? day.monkScore : "Missed"}`}
                      onClick={() => onDayClick && onDayClick(day)} />
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

// ===================== 6. MODALS =====================
const AchievementModal = ({ isOpen, achievement, onClose }) => {
  if (!isOpen || !achievement) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-bg-surface rounded-2xl border border-border-subtle max-w-md w-full p-8 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-discipline-blue/20 border-2 border-discipline-blue/50 flex items-center justify-center mb-4">
            <Award size={48} className="text-discipline-blue" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Achievement Unlocked!</h2>
          <p className="text-lg font-semibold text-discipline-blue mb-3">{achievement.label}</p>
          <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-xs">{achievement.message || "Your discipline is building something extraordinary."}</p>
          <Button onClick={onClose} variant="primary" fullWidth>Continue</Button>
        </div>
      </div>
    </div>
  );
};

const EmergencyModal = ({ isOpen, onClose, onReady, messages }) => {
  const [selected, setSelected] = useState(null);
  if (!isOpen) return null;
  const modes = [
    { key: "gentle", label: "Gentle Push", color: "text-discipline-blue", borderColor: "border-discipline-blue/30" },
    { key: "hard", label: "Hard Truth", color: "text-discipline-amber", borderColor: "border-discipline-amber/30" },
    { key: "war", label: "War Mode", color: "text-discipline-red", borderColor: "border-discipline-red/30" },
  ];
  const handleReady = () => { onReady && onReady(selected); setSelected(null); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-bg-surface rounded-2xl border border-border-subtle max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">I DON'T FEEL LIKE STUDYING</h2>
          <button onClick={() => { setSelected(null); onClose(); }} className="p-2 rounded-lg hover:bg-border-DEFAULT transition-all text-text-secondary hover:text-text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {!selected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modes.map(m => (
              <button key={m.key} onClick={() => setSelected(m.key)} className={`p-6 rounded-xl border-2 ${m.borderColor} bg-bg-surface/50 hover:bg-bg-surface transition-all text-left`}>
                <h3 className={`text-lg font-bold ${m.color} mb-2`}>{m.label}</h3>
                <p className="text-text-secondary text-sm">{m.key === "gentle" ? "A calm reminder to begin." : m.key === "hard" ? "An honest confrontation with procrastination." : "Maximum intensity. Break the cycle."}</p>
              </button>
            ))}
          </div>
        )}
        {selected && messages && messages[selected] && (
          <div className="mt-4 animate-fade-in">
            <div className="bg-bg-surface/50 rounded-xl border border-border-DEFAULT p-6 max-h-[50vh] overflow-y-auto">
              <h3 className={`text-xl font-bold ${messages[selected].color || "text-text-primary"} mb-3`}>{messages[selected].title}</h3>
              <div className="text-text-secondary whitespace-pre-wrap text-base leading-relaxed">{messages[selected].content}</div>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={handleReady} variant="primary" fullWidth>I'M READY TO STUDY</Button>
              <Button onClick={() => setSelected(null)} variant="ghost" fullWidth>Back to Modes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ============================================================
// DISCIPLINEOS — SINGLE FILE APP (App.js) [PART 4/5]
// ============================================================

// ===================== 7. AI COACH (HOOK) =====================
const useAI = () => {
  const [dailyInsight, setDailyInsight] = useState(null);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [monthlyInsight, setMonthlyInsight] = useState(null);
  const [patterns, setPatterns] = useState([]);

  const generateDailyInsight = useCallback((data, todayLog) => {
    if (!data || !todayLog) return "Complete today's session to begin building your discipline profile.";
    const logs = data.dailyLogs.filter(l => l.isLocked && !l.isRecoveredDay);
    if (logs.length === 0) return "No insight available yet. Complete today's session to begin building your discipline profile.";
    const last7 = logs.slice(-7);
    const avgStudy = last7.reduce((a, l) => a + l.studyHours, 0) / last7.length;
    if (todayLog.studyHours > 0 && todayLog.deepWorkSessions === 0 && avgStudy > 0) return "Study hours are consistent but Deep Work sessions are zero. Focus on quality over quantity.";
    if (todayLog.protocols.dopamineControl && todayLog.protocols.planning) return "Excellent discipline today. Dopamine Control and Planning completed. Keep this momentum.";
    if (todayLog.studyHours < 2 && avgStudy > 4) return "Today's study hours are below your weekly average. Try to increase focus tomorrow.";
    if (todayLog.studyHours >= 8 && todayLog.deepWorkSessions >= 3) return "Exceptional day! High study hours and Deep Work consistency. This is how legends are built.";
    if (todayLog.studyHours === 0) return "No study recorded today. Every day counts. Start small if needed, but start.";
    const lbl = getMonkScoreDetails(todayLog.monkScore).label;
    return `Today's discipline was ${lbl}. ${todayLog.monkScore >= 80 ? "Strong performance. Maintain this rhythm." : "Tomorrow is a new opportunity to improve."}`;
  }, []);

  const generateWeeklyReport = useCallback((data, currentDay) => {
    if (!data) return null;
    const logs = data.dailyLogs.filter(l => l.isLocked && !l.isRecoveredDay);
    if (logs.length < 7) return null;
    const last7 = logs.slice(-7);
    const totalStudy = last7.reduce((a, l) => a + l.studyHours, 0);
    const avgMonk = last7.reduce((a, l) => a + l.monkScore, 0) / last7.length;
    const totalXP = last7.reduce((a, l) => a + l.xpEarned, 0);
    const completedDays = last7.filter(l => l.isLocked).length;
    const pc = last7.reduce((acc, l) => { Object.keys(l.protocols).forEach(k => { if (l.protocols[k]) acc[k] = (acc[k]||0)+1; }); return acc; }, {});
    const strongest = Object.keys(pc).reduce((a,b) => pc[a] > pc[b] ? a : b, "deepWork");
    const weakest = Object.keys(pc).reduce((a,b) => pc[a] < pc[b] ? a : b, "skillDevelopment");
    const suggestions = [];
    if (avgMonk < 70) suggestions.push("Focus on consistent Deep Work sessions.");
    if (pc.dopamineControl < 4) suggestions.push("Work on Dopamine Control to reduce distractions.");
    if (totalStudy / 7 < 4) suggestions.push("Aim for at least 4 study hours daily.");
    return {
      weekNumber: getChallengeWeekNumber(currentDay),
      totalStudy: Math.round(totalStudy * 10) / 10,
      avgMonk: Math.round(avgMonk),
      totalXP,
      completedDays,
      strongestHabit: strongest,
      weakestHabit: weakest,
      suggestions: suggestions.length > 0 ? suggestions : ["Great week! Keep the momentum going."],
      summary: `Week ${getChallengeWeekNumber(currentDay)}: ${completedDays}/7 days completed. Average Monk Score: ${Math.round(avgMonk)}.`,
    };
  }, []);

  const generateMonthlyReport = useCallback((data) => {
    if (!data) return null;
    const logs = data.dailyLogs.filter(l => l.isLocked && !l.isRecoveredDay);
    if (logs.length < 30) return null;
    const last30 = logs.slice(-30);
    const totalStudy = last30.reduce((a, l) => a + l.studyHours, 0);
    const avgMonk = last30.reduce((a, l) => a + l.monkScore, 0) / last30.length;
    const totalXP = last30.reduce((a, l) => a + l.xpEarned, 0);
    const completedDays = last30.filter(l => l.isLocked).length;
    const subjects = data.subjectProgress;
    let strongest = null, weakest = null, maxP = -1, minP = 101;
    Object.keys(subjects).forEach(k => {
      const p = (subjects[k].completedChapters / subjects[k].totalChapters) * 100;
      if (p > maxP) { maxP = p; strongest = k; }
      if (p < minP) { minP = p; weakest = k; }
    });
    return {
      month: new Date().toLocaleString("default", { month: "long" }),
      totalStudy: Math.round(totalStudy * 10) / 10,
      avgMonk: Math.round(avgMonk),
      totalXP,
      completedDays,
      strongestSubject: strongest,
      weakestSubject: weakest,
      summary: `Month ${new Date().toLocaleString("default", { month: "long" })}: ${completedDays}/30 days completed. Avg Monk: ${Math.round(avgMonk)}.`,
    };
  }, []);

  const detectPatterns = useCallback((data) => {
    if (!data) return [];
    const logs = data.dailyLogs.filter(l => l.isLocked && !l.isRecoveredDay);
    if (logs.length < 7) return [];
    const p = [];
    const last14 = logs.slice(-14);
    const sundays = last14.filter(l => isSunday(new Date(l.date)));
    const weekdays = last14.filter(l => !isSunday(new Date(l.date)));
    if (sundays.length > 0 && weekdays.length > 0) {
      const avgSun = sundays.reduce((a,l) => a + l.studyHours, 0) / sundays.length;
      const avgWd = weekdays.reduce((a,l) => a + l.studyHours, 0) / weekdays.length;
      if (avgSun < avgWd * 0.5) p.push("Sunday study drop detected. Try to maintain consistency on weekends.");
    }
    const dopamineFailures = last14.filter(l => !l.protocols.dopamineControl).length;
    if (dopamineFailures > 5) p.push("Dopamine Control is frequently missed. Consider reducing social media usage.");
    const deepWorkDays = last14.filter(l => l.deepWorkSessions >= 2).length;
    if (deepWorkDays < 7) p.push("Deep Work sessions are inconsistent. Aim for at least 2 sessions daily.");
    return p;
  }, []);

  const generateInsights = useCallback((data, todayLog, currentDay) => {
    if (!data) return;
    setDailyInsight(generateDailyInsight(data, todayLog));
    setWeeklyInsight(generateWeeklyReport(data, currentDay));
    setMonthlyInsight(generateMonthlyReport(data));
    setPatterns(detectPatterns(data));
  }, [generateDailyInsight, generateWeeklyReport, generateMonthlyReport, detectPatterns]);

  const getEmergencyMessage = (mode) => {
    const messages = {
      gentle: {
        title: "Gentle Push",
        content: `You already know what happens when you listen to every feeling.\n\nYou have spent enough time waiting for motivation, waiting for the perfect mood, waiting for the perfect day.\n\nNone of those things ever changed your life.\n\nWhat changes your life is a single decision followed by a single action.\n\nYou made a commitment to yourself. Not to your teachers. Not to your parents. Not to anyone else.\n\nTo yourself.\n\nYou decided these 200 days would be different.\n\nYou decided discipline would become your identity.\n\nRight now, you do not need to conquer the entire syllabus.\n\nYou do not need to think about your board results.\n\nYou do not need to think about tomorrow.\n\nYou only need to win the next few minutes.\n\nOpen the book.\n\nSit down.\n\nTake one deep breath.\n\nBegin.\n\nMomentum always follows action.\n\nNever the other way around.\n\nThe future version of yourself is waiting for one decision.\n\nThe one you make right now.\n\nStudy for the next 25 minutes only.`,
        color: "text-discipline-blue",
      },
      hard: {
        title: "Hard Truth",
        content: `Let's be honest.\n\nThe last one and a half years did not disappear because of bad luck.\n\nThey disappeared because you kept negotiating with yourself.\n\nOne scroll became ten. Ten minutes became an hour. An hour became another lost day.\n\nYou always knew what needed to be done.\n\nBut every time discomfort appeared, you chose comfort.\n\nEvery time discipline called, you answered with "Tomorrow."\n\nHow many tomorrows have already passed?\n\nHow many promises have you made to yourself and broken?\n\nNobody made those decisions for you.\n\nYou made them.\n\nWhich also means you are the only person capable of reversing them.\n\nNo one is coming to rescue your future.\n\nNot motivation. Not luck. Not your friends. Not your teachers.\n\nThe person responsible is looking back at you from the mirror.\n\nYou created this challenge because you were tired of watching your own potential disappear.\n\nStop negotiating.\n\nStop waiting.\n\nStop searching for motivation.\n\nThe work is already waiting.\n\nEvery minute you delay is a minute that never returns.\n\nStudy for the next 25 minutes only.`,
        color: "text-discipline-amber",
      },
      war: {
        title: "WAR MODE",
        content: `Look carefully at where comfort has brought you.\n\nLook at what procrastination has given you.\n\nNothing.\n\nAbsolutely nothing.\n\nRight now you are standing at a crossroads.\n\nOne road leads back into the same cycle.\n\nScrolling. Excuses. Comfort. Broken promises. Regret.\n\nThe other road is discipline.\n\nNot motivation. Not excitement.\n\nDiscipline.\n\nThe ability to act when every excuse tells you to stop.\n\nNobody forced you to begin this challenge.\n\nYou chose it.\n\nSo stop acting like a prisoner of your own thoughts.\n\nYour mind is not your master.\n\nYou are.\n\nEvery excuse you accept today becomes another chain around your future.\n\nEvery action you take becomes another weapon.\n\nStand up.\n\nWash your face.\n\nSit down.\n\nOpen the book.\n\nFight.\n\nBecause this is no longer about studying.\n\nIt is about proving that your word still means something.\n\nForget your mood.\n\nForget motivation.\n\nForget how you feel.\n\nAction first.\n\nFeelings later.\n\nThe battle begins now.\n\nStudy for the next 25 minutes only.\n\nBuild Discipline.\n\nResults Will Follow.`,
        color: "text-discipline-red",
      },
    };
    return messages[mode] || messages.gentle;
  };

  return { dailyInsight, weeklyInsight, monthlyInsight, patterns, generateInsights, getEmergencyMessage };
};

// ===================== 8. USE DISCIPLINE HOOK =====================
const useDiscipline = () => {
  const [data, setData] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(0);
  const [isTodayLocked, setIsTodayLocked] = useState(false);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isInfinite, setIsInfinite] = useState(false);

  useEffect(() => {
    const init = () => {
      let stored = loadData();
      stored = applyMidnightLock(stored);
      setData(stored);
      const day = getCurrentChallengeDay();
      setCurrentDay(day);
      setIsChallengeActive(hasChallengeStarted());
      setIsInfinite(isInfiniteMode());
      const today = getTodayLog(stored);
      setTodayLog(today || null);
      setIsTodayLocked(today?.isLocked || false);
      setLoading(false);
    };
    init();
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 30) {
        const refreshed = loadData();
        const locked = applyMidnightLock(refreshed);
        setData(locked);
        setCurrentDay(getCurrentChallengeDay());
        setIsInfinite(isInfiniteMode());
        const today = getTodayLog(locked);
        setTodayLog(today || null);
        setIsTodayLocked(today?.isLocked || false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const saveToday = useCallback((inputData) => {
    if (!data) return { success: false, message: "Data not loaded" };
    if (isTodayLocked) return { success: false, message: "Today is already locked" };
    if (!isChallengeActive) return { success: false, message: "Challenge not started yet" };
    const studyHours = parseFloat(inputData.studyHours) || 0;
    const deepWorkSessions = parseInt(inputData.deepWorkSessions) || 0;
    if (studyHours < 0) return { success: false, message: "Study hours cannot be negative" };
    if (deepWorkSessions < 0) return { success: false, message: "Deep Work sessions cannot be negative" };
    if (deepWorkSessions > 4) return { success: false, message: "Max 4 Deep Work sessions allowed" };
    const protocols = {
      deepWork: inputData.protocols?.deepWork || false,
      planning: inputData.protocols?.planning || false,
      dopamineControl: inputData.protocols?.dopamineControl || false,
      skillDevelopment: inputData.protocols?.skillDevelopment || false,
    };
    const selfCare = {
      hairCare: inputData.selfCare?.hairCare || false,
      skinCare: inputData.selfCare?.skinCare || false,
      eyeCare: inputData.selfCare?.eyeCare || false,
    };
    const mockTestScore = inputData.mockTestScore !== undefined ? parseFloat(inputData.mockTestScore) : null;
    const result = saveTodayEntry(data, { studyHours, deepWorkSessions, protocols, selfCare, mockTestScore });
    if (result.success) {
      setData(result.data);
      const today = getTodayLog(result.data);
      setTodayLog(today || null);
      setIsTodayLocked(true);
      setCurrentDay(getCurrentChallengeDay());
      setIsInfinite(isInfiniteMode());
      return { success: true, data: result.data, log: today };
    }
    return result;
  }, [data, isTodayLocked, isChallengeActive]);

  const useRecoveryDay = useCallback(() => {
    if (!data) return { success: false, message: "Data not loaded" };
    if (data.userStats.recoveryDaysLeft <= 0) return { success: false, message: "No Recovery Days left" };
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = getISODate(yesterday);
    const yesterdayLog = data.dailyLogs.find(l => l.date === yesterdayISO);
    if (!yesterdayLog) return { success: false, message: "No entry found for yesterday" };
    if (yesterdayLog.isLocked) return { success: false, message: "Yesterday is already locked" };
    yesterdayLog.isRecoveredDay = true;
    yesterdayLog.isLocked = true;
    yesterdayLog.monkScore = 0;
    yesterdayLog.xpEarned = 0;
    data.userStats.recoveryDaysLeft -= 1;
    data.recoveryHistory.push({ date: yesterdayISO, reason: "Emergency recovery" });
    saveData(data);
    setData(data);
    setTodayLog(getTodayLog(data));
    return { success: true, message: "Recovery Day used successfully. Streak preserved.", remaining: data.userStats.recoveryDaysLeft };
  }, [data]);

  const updateSubjectChapter = useCallback((subjectKey, completedChapters) => {
    if (!data) return;
    const subject = data.subjectProgress[subjectKey];
    if (!subject) return;
    const completed = Math.min(Math.max(0, completedChapters), subject.totalChapters);
    subject.completedChapters = completed;
    saveData(data);
    setData({ ...data });
  }, [data]);

  const getComputedStats = useCallback(() => {
    if (!data) return null;
    const totalElapsedDays = currentDay > 0 ? currentDay : 0;
    const consistencyPercent = calculateConsistency({ totalDaysCompleted: data.userStats.totalDaysCompleted, totalElapsedDays });
    const avgMonk = calculateAverageMonkScore(data.dailyLogs);
    const rank = getCurrentRank({
      totalXP: data.userStats.totalXP,
      avgMonkScore: avgMonk,
      consistencyPercent,
      totalDaysCompleted: data.userStats.totalDaysCompleted,
      infiniteModeUnlocked: data.userStats.infiniteModeUnlocked || false,
    });
    const todayScore = todayLog?.monkScore || 0;
    const todayDetails = getMonkScoreDetails(todayScore);
    return {
      currentDay,
      totalDaysCompleted: data.userStats.totalDaysCompleted,
      totalXP: data.userStats.totalXP,
      currentRank: rank,
      streakCount: data.userStats.streakCount,
      bestStreak: data.userStats.bestStreak,
      recoveryDaysLeft: data.userStats.recoveryDaysLeft,
      consistencyPercent,
      avgMonkScore: avgMonk,
      todayMonkScore: todayScore,
      todayMonkLabel: todayDetails.label,
      todayMonkColor: todayDetails.color,
      isTodayLocked,
      isInfinite,
      isChallengeActive,
      dailyLogs: data.dailyLogs,
      subjectProgress: data.subjectProgress,
      achievements: data.achievements || [],
      xpHistory: data.xpHistory,
    };
  }, [data, currentDay, todayLog, isTodayLocked, isInfinite, isChallengeActive]);

  const getTodayInputDefaults = useCallback(() => {
    if (!todayLog || todayLog.isLocked) {
      return {
        studyHours: "",
        deepWorkSessions: "",
        mockTestScore: "",
        protocols: { deepWork: false, planning: false, dopamineControl: false, skillDevelopment: false },
        selfCare: { hairCare: false, skinCare: false, eyeCare: false },
        isLocked: todayLog?.isLocked || false,
        isSunday: isSunday(new Date()),
      };
    }
    return {
      studyHours: todayLog.studyHours || "",
      deepWorkSessions: todayLog.deepWorkSessions || "",
      mockTestScore: todayLog.mockTestScore !== null ? todayLog.mockTestScore : "",
      protocols: { ...todayLog.protocols },
      selfCare: { ...todayLog.selfCare },
      isLocked: todayLog.isLocked || false,
      isSunday: isSunday(new Date(todayLog.date)),
    };
  }, [todayLog]);

  return {
    loading,
    data,
    todayLog,
    saveToday,
    useRecoveryDay,
    updateSubjectChapter,
    getComputedStats,
    getTodayInputDefaults,
    currentDay,
    isTodayLocked,
    isChallengeActive,
    isInfinite,
  };
};

// ===================== 9. PAGES =====================
const HomePage = ({ setEmergencyOpen }) => {
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

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleProtocolChange = (key, value) => setFormData(prev => ({ ...prev, protocols: { ...prev.protocols, [key]: value } }));
  const handleSelfCareChange = (key, value) => setFormData(prev => ({ ...prev, selfCare: { ...prev.selfCare, [key]: value } }));

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
      setSaveMessage("Day Saved Successfully. Another disciplined day completed.");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage(result.message || "Error saving day.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-text-secondary">Loading DisciplineOS...</div></div>;

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
          <p className="text-text-secondary text-sm">{getFormattedDate(new Date())}</p>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            DAY {dayDisplay}
            {isTodayLocked && <span className="text-xs bg-discipline-blue/20 text-discipline-blue px-2 py-1 rounded-full font-normal flex items-center gap-1"><Lock size={12} /> Locked</span>}
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
              <p className="text-3xl font-bold text-text-primary">{isTodayLocked ? stats?.todayMonkScore ?? 0 : "--"}</p>
              {monkDetails && isTodayLocked && <p className={`text-sm font-medium text-discipline-${monkDetails.color}`}>{monkDetails.label}</p>}
            </div>
            <div>
              <p className="text-sm text-text-secondary text-right">Total XP</p>
              <p className="text-2xl font-bold text-text-primary">{stats?.totalXP || 0}</p>
            </div>
          </div>
          <ProgressBar value={80} max={100} label={`${stats?.currentRank?.label || "E"} → ${stats?.currentRank?.id === "LEGEND" ? "MAX" : "Next"}`} showLabel />
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
              <StepperInput label="Deep Work Sessions (Max 4)" value={parseInt(formData.deepWorkSessions) || 0} onChange={(v) => handleInputChange("deepWorkSessions", v)} min={0} max={4} step={1} />
              <Input label="Study Hours (Max 10 counted)" type="number" step="0.5" min="0" max="12" value={formData.studyHours} onChange={(e) => handleInputChange("studyHours", e.target.value)} placeholder="e.g. 6.5" helperText={formData.studyHours > 10 ? "Values above 10 are recorded but not scored." : ""} />
              {todayIsSunday && <Input label="Sunday Mock Test Score (%)" type="number" step="1" min="0" max="100" value={formData.mockTestScore} onChange={(e) => handleInputChange("mockTestScore", e.target.value)} placeholder="0-100" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Discipline Protocols</CardTitle></CardHeader>
            <CardContent>
              <CheckboxGroup>
                <Checkbox label="Deep Work Completed" checked={formData.protocols.deepWork} onChange={(v) => handleProtocolChange("deepWork", v)} />
                <Checkbox label="Daily Planning Completed" checked={formData.protocols.planning} onChange={(v) => handleProtocolChange("planning", v)} />
                <Checkbox label="Dopamine Control" checked={formData.protocols.dopamineControl} onChange={(v) => handleProtocolChange("dopamineControl", v)} />
                <Checkbox label="Skill Development" checked={formData.protocols.skillDevelopment} onChange={(v) => handleProtocolChange("skillDevelopment", v)} />
              </CheckboxGroup>
            </CardContent>
          </Card>

          <details className="group">
            <summary className="cursor-pointer text-text-secondary hover:text-text-primary transition-all text-sm font-medium list-none flex items-center gap-2">
              <span className="inline-block transition-transform group-open:rotate-90">▶</span>
              Optional Self Care
            </summary>
            <div className="mt-3 pl-4 space-y-2">
              <Checkbox label="Hair Care" checked={formData.selfCare.hairCare} onChange={(v) => handleSelfCareChange("hairCare", v)} />
              <Checkbox label="Skin Care" checked={formData.selfCare.skinCare} onChange={(v) => handleSelfCareChange("skinCare", v)} />
              <Checkbox label="Eye Care" checked={formData.selfCare.eyeCare} onChange={(v) => handleSelfCareChange("eyeCare", v)} />
            </div>
          </details>

          <Button onClick={handleSave} variant="primary" fullWidth size="lg">SAVE TODAY</Button>
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

const DetailsPage = () => {
  const { getComputedStats, currentDay } = useDiscipline();
  const { generateInsights, weeklyInsight, monthlyInsight, patterns } = useAI();
  const stats = getComputedStats();

  useEffect(() => {
    if (stats) generateInsights(stats.dailyLogs, stats.todayMonkScore, currentDay);
  }, [stats, generateInsights, currentDay]);

  if (!stats) return <div className="text-text-secondary">Loading analytics...</div>;

  const logs = stats.dailyLogs || [];
  const subjects = stats.subjectProgress || {};

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
      <Card>
        <CardHeader><CardTitle>Weekly Overview</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-text-muted">Total XP</p><p className="text-xl font-bold text-text-primary">{stats.totalXP}</p></div>
          <div><p className="text-xs text-text-muted">Avg Monk</p><p className="text-xl font-bold text-text-primary">{stats.avgMonkScore}</p></div>
          <div><p className="text-xs text-text-muted">Streak</p><p className="text-xl font-bold text-text-primary">{stats.streakCount} days</p></div>
          <div><p className="text-xs text-text-muted">Consistency</p><p className="text-xl font-bold text-text-primary">{stats.consistencyPercent}%</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>200-Day Discipline Heatmap</CardTitle></CardHeader>
        <CardContent>
          <Heatmap logs={logs} startDate={CHALLENGE_START_DATE} onDayClick={(d) => console.log(d)} />
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
        <CardHeader><CardTitle>Subject Mastery</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(SUBJECTS).map(([key, sub]) => {
            const prog = subjects[key] || { completedChapters: 0, totalChapters: sub.totalChapters };
            const pct = Math.round((prog.completedChapters / sub.totalChapters) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary">{sub.icon} {sub.label}</span>
                  <span className="text-text-secondary">{prog.completedChapters}/{sub.totalChapters}</span>
                </div>
                <ProgressBar value={pct} max={100} color={pct > 70 ? "bg-discipline-blue" : "bg-discipline-amber"} height="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI Coach</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {weeklyInsight && <div className="border border-border-DEFAULT rounded-lg p-3"><p className="text-xs text-text-muted uppercase tracking-wider">Weekly Report</p><p className="text-text-primary text-sm">{weeklyInsight.summary}</p>{weeklyInsight.suggestions?.map((s,i) => <li key={i} className="text-text-secondary text-sm list-disc list-inside">{s}</li>)}</div>}
          {monthlyInsight && <div className="border border-border-DEFAULT rounded-lg p-3"><p className="text-xs text-text-muted uppercase tracking-wider">Monthly Report</p><p className="text-text-primary text-sm">{monthlyInsight.summary}</p></div>}
          {patterns && patterns.length > 0 && <div className="border border-discipline-amber/30 bg-discipline-amber/5 rounded-lg p-3"><p className="text-xs text-discipline-amber uppercase tracking-wider">Patterns Detected</p>{patterns.map((p,i) => <p key={i} className="text-sm text-text-secondary">• {p}</p>)}</div>}
        </CardContent>
      </Card>
    </div>
  );
};

const ProfilePage = () => {
  const { getComputedStats, useRecoveryDay, data } = useDiscipline();
  const stats = getComputedStats();
  if (!stats) return <div className="text-text-secondary">Loading profile...</div>;
  const achievements = data?.achievements || [];
  const recoveryLeft = stats.recoveryDaysLeft || 10;

  const handleUseRecovery = () => {
    if (window.confirm("Use one Recovery Day to preserve your streak? (No XP/Monk Score awarded)")) {
      const result = useRecoveryDay();
      if (result.success) alert(`Recovery Day used. ${result.remaining} remaining.`);
      else alert(result.message);
    }
  };

  const unlockedIds = achievements.map(a => a.id);

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
      <Card variant="elevated">
        <CardContent className="text-center py-6">
          <div className="w-24 h-24 rounded-full bg-discipline-blue/20 border-2 border-discipline-blue/50 mx-auto flex items-center justify-center mb-3"><Shield size={40} className="text-discipline-blue" /></div>
          <h2 className="text-2xl font-bold text-text-primary">Rank {stats.currentRank?.label || "E"}</h2>
          <p className="text-text-secondary text-sm">Total XP: {stats.totalXP}</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div><p className="text-text-muted">Streak</p><p className="text-lg font-bold text-text-primary">{stats.streakCount}</p></div>
            <div><p className="text-text-muted">Best</p><p className="text-lg font-bold text-text-primary">{stats.bestStreak}</p></div>
            <div><p className="text-text-muted">Consistency</p><p className="text-lg font-bold text-text-primary">{stats.consistencyPercent}%</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock size={18} /> Recovery Days</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">{recoveryLeft} / 10 remaining</span>
            <Button onClick={handleUseRecovery} variant="secondary" size="sm" disabled={recoveryLeft <= 0}>Use Recovery Day</Button>
          </div>
          <p className="text-xs text-text-muted">Recovery Days preserve your streak but award 0 XP/Monk Score.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award size={18} /> Achievements</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = unlockedIds.includes(ach.id);
              return (
                <div key={ach.id} className={`p-3 rounded-lg border text-center transition-all ${unlocked ? "border-discipline-blue/50 bg-discipline-blue/10" : "border-border-DEFAULT bg-bg-surface/30 opacity-50"}`}>
                  <Award size={24} className={`mx-auto mb-1 ${unlocked ? "text-discipline-blue" : "text-text-muted"}`} />
                  <p className={`text-xs font-medium ${unlocked ? "text-text-primary" : "text-text-muted"}`}>{ach.label}</p>
                  {unlocked && <p className="text-[10px] text-text-muted mt-1">✓ Unlocked</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Infinity size={18} /> Infinite Mode</CardTitle></CardHeader>
        <CardContent>
          {stats.isInfinite ? <p className="text-discipline-emerald font-medium">🔓 Unlocked — Discipline continues forever.</p> : <p className="text-text-secondary">Complete 200 days to unlock Infinite Mode.</p>}
        </CardContent>
      </Card>
    </div>
  );
};
// ============================================================
// DISCIPLINEOS — SINGLE FILE APP (App.js) [PART 5/5]
// ============================================================

// ===================== 10. MAIN APP =====================
const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [theme, setTheme] = useState("dark");
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("disciplineOS_theme") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("disciplineOS_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const { getEmergencyMessage } = useAI();

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "details", label: "Details", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  const renderPage = () => {
    switch(currentPage) {
      case "details": return <DetailsPage />;
      case "profile": return <ProfilePage />;
      default: return <HomePage setEmergencyOpen={setEmergencyOpen} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-20 md:pb-0">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-border-DEFAULT md:bg-bg-surface/80 md:backdrop-blur-sm">
        <div className="flex h-16 items-center border-b border-border-DEFAULT px-6">
          <h1 className="text-xl font-bold tracking-tight">Discipline<span className="text-discipline-blue">OS</span></h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${currentPage === item.id ? "bg-discipline-blue/10 text-discipline-blue" : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
          <button onClick={() => setEmergencyOpen(true)} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-discipline-red hover:bg-discipline-red/10 transition-all">
            <AlertTriangle size={20} /> Emergency
          </button>
        </nav>
        <div className="border-t border-border-DEFAULT p-4"><ThemeToggle theme={theme} onToggle={toggleTheme} /></div>
      </aside>

      <main className="md:ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">{renderPage()}</div>
      </main>

      <nav className="md:hidden bottom-nav pb-safe">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-all ${currentPage === item.id ? "text-discipline-blue" : "text-text-muted hover:text-text-secondary"}`}>
            <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 1.5} />
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={() => setEmergencyOpen(true)} className="flex flex-col items-center gap-0.5 text-xs font-medium text-discipline-red hover:text-red-400 transition-all">
          <AlertTriangle size={22} /> <span>Emergency</span>
        </button>
      </nav>

      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        onReady={(mode) => console.log("Emergency:", mode)}
        messages={{
          gentle: { title: getEmergencyMessage("gentle").title, content: getEmergencyMessage("gentle").content, color: "text-discipline-blue" },
          hard: { title: getEmergencyMessage("hard").title, content: getEmergencyMessage("hard").content, color: "text-discipline-amber" },
          war: { title: getEmergencyMessage("war").title, content: getEmergencyMessage("war").content, color: "text-discipline-red" },
        }}
      />
    </div>
  );
};

export default App;

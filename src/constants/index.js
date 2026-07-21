// ============================================
// CONSTANTS / INDEX.JS
// DISCIPLINEOS — PERMANENT PRODUCT DATA
// ============================================

// ---------- CHALLENGE ----------
export const CHALLENGE_START_DATE = new Date("2026-07-22T00:00:00");
export const CHALLENGE_DURATION_DAYS = 200;
export const MAX_STUDY_HOURS_COUNTED = 10;
export const MAX_DEEP_WORK_SESSIONS = 4;
export const TOTAL_RECOVERY_DAYS = 10;

// ---------- SUBJECTS & CHAPTERS ----------
export const SUBJECTS = {
  physics: { label: "Physics", totalChapters: 14, icon: "⚛️" },
  chemistry: { label: "Chemistry", totalChapters: 16, icon: "🧪" },
  maths: { label: "Maths", totalChapters: 13, icon: "📐" },
  english: { label: "English", totalChapters: 21, icon: "📖" },
  urdu: { label: "Urdu", totalChapters: 39, icon: "🖋️" },
};

// ---------- RANKS ----------
export const RANKS = [
  { id: "E", label: "E", minXP: 0, minMonk: 0, minConsistency: 0 },
  { id: "D", label: "D", minXP: 500, minMonk: 60, minConsistency: 70 },
  { id: "C", label: "C", minXP: 1500, minMonk: 68, minConsistency: 75 },
  { id: "B", label: "B", minXP: 3500, minMonk: 75, minConsistency: 80 },
  { id: "A", label: "A", minXP: 7000, minMonk: 82, minConsistency: 85 },
  { id: "S", label: "S", minXP: 15000, minMonk: 85, minConsistency: 90, requiresDay200: true },
  { id: "LEGEND", label: "LEGEND", minXP: 15000, minMonk: 85, minConsistency: 90, requiresInfinite: true },
];

// ---------- MONK SCORE LABELS ----------
export const MONK_SCORE_LEVELS = [
  { min: 95, max: 100, label: "Legendary Day", color: "emerald" },
  { min: 90, max: 94, label: "Exceptional Day", color: "blue" },
  { min: 80, max: 89, label: "Strong Day", color: "cyan" },
  { min: 70, max: 79, label: "Good Day", color: "amber" },
  { min: 60, max: 69, label: "Steady Day", color: "orange" },
  { min: 40, max: 59, label: "Needs Improvement", color: "orange" },
  { min: 0, max: 39, label: "Recovery Needed", color: "red" },
];

// ---------- HEATMAP COLORS ----------
export const HEATMAP_COLORS = {
  0: "#6B7280",
  25: "#EF4444",
  50: "#F59E0B",
  65: "#06B6D4",
  80: "#3B82F6",
  95: "#10B981",
  RECOVERY: "#8B5CF6",
};

// ---------- ACHIEVEMENTS ----------
export const ACHIEVEMENTS = [
  { id: "first_step", label: "First Step", condition: (state) => state.totalDaysCompleted >= 1, message: "The first day is always the hardest. You showed up." },
  { id: "seven_days_strong", label: "Seven Days Strong", condition: (state) => state.currentStreak >= 7, message: "A full week of discipline. This is where momentum begins." },
  { id: "momentum_builder", label: "Momentum Builder", condition: (state) => state.currentStreak >= 30, message: "30 days. You're no longer experimenting—you're becoming." },
  { id: "iron_discipline", label: "Iron Discipline", condition: (state) => state.currentStreak >= 60, message: "60 days. Discipline is now part of your daily identity." },
  { id: "century_mind", label: "Century Mind", condition: (state) => state.totalDaysCompleted >= 100, message: "100 days. Most people never reach this. You did." },
  { id: "unbreakable", label: "Unbreakable", condition: (state) => state.totalDaysCompleted >= 150, message: "150 days. Your consistency is now a force of nature." },
  { id: "legend", label: "Legend", condition: (state) => state.totalDaysCompleted >= 200, message: "200 days. You didn't just complete a challenge—you rewired your identity." },
  { id: "infinite_walker", label: "Infinite Walker", condition: (state) => state.infiniteModeUnlocked === true, message: "The challenge ends. Discipline continues forever." },
];

// ---------- CONSISTENCY BONUSES ----------
export const CONSISTENCY_BONUSES = [
  { streak: 7, xp: 10 },
  { streak: 30, xp: 30 },
  { streak: 60, xp: 60 },
  { streak: 100, xp: 100 },
  { streak: 150, xp: 150 },
  { streak: 200, xp: 300 },
];

// ---------- DEFAULT DATA ----------
export const DEFAULT_DATA = {
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
  settings: {
    theme: "dark",
  },
};

// ---------- DAILY LOG SCHEMA ----------
export const createDailyLog = (dayNumber, dateISO) => ({
  date: dateISO,
  dayNumber: dayNumber,
  studyHours: 0,
  deepWorkSessions: 0,
  mockTestScore: null,
  protocols: {
    deepWork: false,
    planning: false,
    dopamineControl: false,
    skillDevelopment: false,
  },
  selfCare: {
    hairCare: false,
    skinCare: false,
    eyeCare: false,
  },
  monkScore: 0,
  xpEarned: 0,
  isRecoveredDay: false,
  isMissedDay: false,
  isLocked: false,
});

// ---------- XP WEIGHTS ----------
export const XP_WEIGHTS = {
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

export const MONK_WEIGHTS = {
  study: 0.40,
  deepWork: 0.20,
  protocols: 0.20,
  mockTest: 0.20,
};

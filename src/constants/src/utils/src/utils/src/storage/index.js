// ============================================
// STORAGE / INDEX.JS
// DISCIPLINEOS — LOCAL STORAGE ENGINE
// ============================================

import { DEFAULT_DATA, createDailyLog } from "../constants";
import { getTodayMidnight, getISODate, getCurrentChallengeDay } from "../utils/dateUtils";
import {
  calculateMonkScore,
  calculateDailyXP,
  calculateConsistencyBonus,
  getCurrentRank,
  calculateConsistency,
} from "../utils/mathUtils";

const STORAGE_KEY = "disciplineOS_data";

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
      saveData(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), parsed);
    return merged;
  } catch (e) {
    console.warn("Storage load failed, resetting to defaults.", e);
    const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData(fresh);
    return fresh;
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save data:", e);
    return false;
  }
};

const deepMerge = (target, source) => {
  if (!source) return target;
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        target[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};

export const getTodayLog = (data) => {
  const todayISO = getISODate(new Date());
  return data.dailyLogs.find((log) => log.date === todayISO);
};

export const getLogByDate = (data, dateISO) => {
  return data.dailyLogs.find((log) => log.date === dateISO);
};

export const saveTodayEntry = (data, inputData) => {
  const todayISO = getISODate(new Date());
  const dayNumber = getCurrentChallengeDay();

  let log = data.dailyLogs.find((l) => l.date === todayISO);
  if (!log) {
    log = createDailyLog(dayNumber, todayISO);
    data.dailyLogs.push(log);
  }

  if (log.isLocked) {
    console.warn("Today is locked, cannot edit.");
    return { success: false, data, message: "Day is locked" };
  }

  log.studyHours = Math.max(0, inputData.studyHours || 0);
  log.deepWorkSessions = Math.max(0, inputData.deepWorkSessions || 0);
  log.mockTestScore = inputData.mockTestScore !== undefined ? inputData.mockTestScore : null;
  log.protocols = { ...log.protocols, ...inputData.protocols };
  log.selfCare = { ...log.selfCare, ...inputData.selfCare };

  const isSunday = new Date(todayISO).getDay() === 0;
  log.monkScore = calculateMonkScore({
    studyHours: log.studyHours,
    deepWorkSessions: log.deepWorkSessions,
    protocols: log.protocols,
    mockTestScore: log.mockTestScore,
    isSunday,
  });

  const baseXP = calculateDailyXP({
    studyHours: log.studyHours,
    deepWorkSessions: log.deepWorkSessions,
    protocols: log.protocols,
    mockTestScore: log.mockTestScore,
    isSunday,
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
    sourceBreakdown: {
      study: 0,
      deepWork: 0,
      protocols: 0,
      mockTest: 0,
      consistency: bonusXP,
    },
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

export const calculateAverageMonkScore = (logs) => {
  const saved = logs.filter((l) => l.isLocked && !l.isRecoveredDay);
  if (saved.length === 0) return 0;
  const sum = saved.reduce((acc, l) => acc + l.monkScore, 0);
  return Math.round(sum / saved.length);
};

export const applyMidnightLock = (data) => {
  const todayISO = getISODate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = getISODate(yesterday);

  const yesterdayLog = data.dailyLogs.find((l) => l.date === yesterdayISO);
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

export const resetAppData = () => {
  const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveData(fresh);
  return fresh;
};

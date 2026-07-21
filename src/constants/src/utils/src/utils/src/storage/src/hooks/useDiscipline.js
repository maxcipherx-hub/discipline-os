// ============================================
// HOOKS / USEDISCIPLINE.JS
// DISCIPLINEOS — MAIN STATE MACHINE
// ============================================

import { useState, useEffect, useCallback } from "react";
import {
  loadData,
  saveData,
  getTodayLog,
  saveTodayEntry,
  applyMidnightLock,
  calculateAverageMonkScore,
} from "../storage";
import {
  getCurrentChallengeDay,
  getISODate,
  isSunday,
  hasChallengeStarted,
  isInfiniteMode,
} from "../utils/dateUtils";
import {
  calculateMonkScore,
  calculateDailyXP,
  calculateConsistencyBonus,
  getCurrentRank,
  calculateConsistency,
  getMonkScoreDetails,
} from "../utils/mathUtils";

export const useDiscipline = () => {
  const [data, setData] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(0);
  const [isTodayLocked, setIsTodayLocked] = useState(false);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isInfinite, setIsInfinite] = useState(false);

  useEffect(() => {
    const initialize = () => {
      const stored = loadData();
      setData(stored);

      const lockedData = applyMidnightLock(stored);
      if (lockedData !== stored) {
        setData(lockedData);
      }

      const day = getCurrentChallengeDay();
      setCurrentDay(day);
      setIsChallengeActive(hasChallengeStarted());
      setIsInfinite(isInfiniteMode());

      const today = getTodayLog(lockedData);
      setTodayLog(today || null);
      setIsTodayLocked(today?.isLocked || false);

      setLoading(false);
    };

    initialize();

    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes();
      const secs = now.getSeconds();

      if (hours === 0 && mins === 0 && secs < 30) {
        const refreshed = loadData();
        const locked = applyMidnightLock(refreshed);
        setData(locked);
        const day = getCurrentChallengeDay();
        setCurrentDay(day);
        setIsInfinite(isInfiniteMode());
        const today = getTodayLog(locked);
        setTodayLog(today || null);
        setIsTodayLocked(today?.isLocked || false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const saveToday = useCallback(
    (inputData) => {
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

      const payload = {
        studyHours,
        deepWorkSessions,
        protocols,
        selfCare,
        mockTestScore,
      };

      const result = saveTodayEntry(data, payload);

      if (result.success) {
        setData(result.data);
        const today = getTodayLog(result.data);
        setTodayLog(today || null);
        setIsTodayLocked(true);
        setCurrentDay(getCurrentChallengeDay());
        setIsInfinite(isInfiniteMode());
        return { success: true, data: result.data, log: today };
      } else {
        return result;
      }
    },
    [data, isTodayLocked, isChallengeActive]
  );

  const useRecoveryDay = useCallback(() => {
    if (!data) return { success: false, message: "Data not loaded" };
    if (data.userStats.recoveryDaysLeft <= 0) {
      return { success: false, message: "No Recovery Days left" };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = getISODate(yesterday);
    const yesterdayLog = data.dailyLogs.find((l) => l.date === yesterdayISO);

    if (!yesterdayLog) {
      return { success: false, message: "No entry found for yesterday" };
    }

    if (yesterdayLog.isLocked) {
      return { success: false, message: "Yesterday is already locked" };
    }

    yesterdayLog.isRecoveredDay = true;
    yesterdayLog.isLocked = true;
    yesterdayLog.monkScore = 0;
    yesterdayLog.xpEarned = 0;
    data.userStats.recoveryDaysLeft -= 1;
    data.recoveryHistory.push({
      date: yesterdayISO,
      reason: "Emergency recovery",
    });

    saveData(data);
    setData(data);
    setTodayLog(getTodayLog(data));

    return {
      success: true,
      message: "Recovery Day used successfully. Streak preserved.",
      remaining: data.userStats.recoveryDaysLeft,
    };
  }, [data]);

  const resetStreak = useCallback(() => {
    if (!data) return;
    data.userStats.streakCount = 0;
    saveData(data);
    setData(data);
  }, [data]);

  const updateSubjectChapter = useCallback(
    (subjectKey, completedChapters) => {
      if (!data) return;
      const subject = data.subjectProgress[subjectKey];
      if (!subject) return;

      const total = subject.totalChapters;
      const completed = Math.min(Math.max(0, completedChapters), total);
      subject.completedChapters = completed;

      saveData(data);
      setData({ ...data });
    },
    [data]
  );

  const getComputedStats = useCallback(() => {
    if (!data) return null;

    const totalDaysElapsed = currentDay > 0 ? currentDay : 0;
    const consistencyPercent = calculateConsistency({
      totalDaysCompleted: data.userStats.totalDaysCompleted,
      totalElapsedDays: totalDaysElapsed,
    });

    const avgMonk = calculateAverageMonkScore(data.dailyLogs);

    const rank = getCurrentRank({
      totalXP: data.userStats.totalXP,
      avgMonkScore: avgMonk,
      consistencyPercent: consistencyPercent,
      totalDaysCompleted: data.userStats.totalDaysCompleted,
      infiniteModeUnlocked: data.userStats.infiniteModeUnlocked || false,
    });

    const todayScore = todayLog?.monkScore || 0;
    const todayDetails = getMonkScoreDetails(todayScore);

    return {
      currentDay,
      totalDaysElapsed,
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
      weeklyReports: data.weeklyReports || [],
      monthlyReports: data.monthlyReports || [],
    };
  }, [data, currentDay, todayLog, isTodayLocked, isInfinite, isChallengeActive]);

  const getTodayInputDefaults = useCallback(() => {
    if (!todayLog || todayLog.isLocked) {
      return {
        studyHours: "",
        deepWorkSessions: "",
        mockTestScore: "",
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

  const checkAndUnlockAchievements = useCallback(() => {
    if (!data) return [];
    return data.achievements || [];
  }, [data]);

  return {
    loading,
    data,
    todayLog,
    saveToday,
    useRecoveryDay,
    resetStreak,
    updateSubjectChapter,
    getComputedStats,
    getTodayInputDefaults,
    checkAndUnlockAchievements,
    currentDay,
    isTodayLocked,
    isChallengeActive,
    isInfinite,
  };
};

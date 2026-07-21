// ============================================
// HOOKS / USEAI.JS
// DISCIPLINEOS — OFFLINE AI COACH ENGINE
// ============================================

import { useState, useCallback } from "react";
import { getChallengeWeekNumber, isSunday } from "../utils/dateUtils";
import { getMonkScoreDetails } from "../utils/mathUtils";

export const useAI = () => {
  const [dailyInsight, setDailyInsight] = useState(null);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [monthlyInsight, setMonthlyInsight] = useState(null);
  const [patterns, setPatterns] = useState([]);

  const generateDailyInsight = useCallback((data, todayLog) => {
    if (!data || !todayLog) return "Complete today's session to begin building your discipline profile.";

    const logs = data.dailyLogs.filter((l) => l.isLocked && !l.isRecoveredDay);
    if (logs.length === 0) {
      return "No insight available yet. Complete today's session to begin building your discipline profile.";
    }

    const last7 = logs.slice(-7);
    const avgStudy = last7.reduce((acc, l) => acc + l.studyHours, 0) / last7.length;

    if (todayLog.studyHours > 0 && todayLog.deepWorkSessions === 0 && avgStudy > 0) {
      return "Study hours are consistent but Deep Work sessions are zero. Focus on quality over quantity.";
    }

    if (todayLog.protocols.dopamineControl && todayLog.protocols.planning) {
      return "Excellent discipline today. Dopamine Control and Planning completed. Keep this momentum.";
    }

    if (todayLog.studyHours < 2 && avgStudy > 4) {
      return "Today's study hours are below your weekly average. Try to increase focus tomorrow.";
    }

    if (todayLog.studyHours >= 8 && todayLog.deepWorkSessions >= 3) {
      return "Exceptional day! High study hours and Deep Work consistency. This is how legends are built.";
    }

    if (todayLog.studyHours === 0) {
      return "No study recorded today. Every day counts. Start small if needed, but start.";
    }

    const monkLabel = getMonkScoreDetails(todayLog.monkScore).label;
    return `Today's discipline was ${monkLabel}. ${
      todayLog.monkScore >= 80
        ? "Strong performance. Maintain this rhythm."
        : "Tomorrow is a new opportunity to improve."
    }`;
  }, []);

  const generateWeeklyReport = useCallback((data, currentDay) => {
    if (!data) return null;
    const logs = data.dailyLogs.filter((l) => l.isLocked && !l.isRecoveredDay);
    if (logs.length < 7) return null;

    const last7 = logs.slice(-7);
    const totalStudy = last7.reduce((acc, l) => acc + l.studyHours, 0);
    const avgMonk = last7.reduce((acc, l) => acc + l.monkScore, 0) / last7.length;
    const totalXP = last7.reduce((acc, l) => acc + l.xpEarned, 0);
    const completedDays = last7.filter((l) => l.isLocked).length;

    const protocolsCount = last7.reduce((acc, l) => {
      Object.keys(l.protocols).forEach((key) => {
        if (l.protocols[key]) acc[key] = (acc[key] || 0) + 1;
      });
      return acc;
    }, {});

    const strongestHabit = Object.keys(protocolsCount).reduce(
      (a, b) => (protocolsCount[a] > protocolsCount[b] ? a : b),
      "deepWork"
    );
    const weakestHabit = Object.keys(protocolsCount).reduce(
      (a, b) => (protocolsCount[a] < protocolsCount[b] ? a : b),
      "skillDevelopment"
    );

    const suggestions = [];
    if (avgMonk < 70) suggestions.push("Focus on consistent Deep Work sessions.");
    if (protocolsCount.dopamineControl < 4) suggestions.push("Work on Dopamine Control to reduce distractions.");
    if (totalStudy / 7 < 4) suggestions.push("Aim for at least 4 study hours daily.");

    const report = {
      weekNumber: getChallengeWeekNumber(currentDay),
      totalStudy: Math.round(totalStudy * 10) / 10,
      avgMonk: Math.round(avgMonk),
      totalXP,
      completedDays,
      strongestHabit,
      weakestHabit,
      suggestions: suggestions.length > 0 ? suggestions : ["Great week! Keep the momentum going."],
      summary: `Week ${getChallengeWeekNumber(currentDay)}: ${completedDays}/7 days completed. Average Monk Score: ${Math.round(
        avgMonk
      )}.`,
    };

    return report;
  }, []);

  const generateMonthlyReport = useCallback((data) => {
    if (!data) return null;
    const logs = data.dailyLogs.filter((l) => l.isLocked && !l.isRecoveredDay);
    if (logs.length < 30) return null;

    const last30 = logs.slice(-30);
    const totalStudy = last30.reduce((acc, l) => acc + l.studyHours, 0);
    const avgMonk = last30.reduce((acc, l) => acc + l.monkScore, 0) / last30.length;
    const totalXP = last30.reduce((acc, l) => acc + l.xpEarned, 0);
    const completedDays = last30.filter((l) => l.isLocked).length;

    const subjects = data.subjectProgress;
    let strongestSubject = null;
    let weakestSubject = null;
    let maxProgress = -1;
    let minProgress = 101;
    Object.keys(subjects).forEach((key) => {
      const p = (subjects[key].completedChapters / subjects[key].totalChapters) * 100;
      if (p > maxProgress) {
        maxProgress = p;
        strongestSubject = key;
      }
      if (p < minProgress) {
        minProgress = p;
        weakestSubject = key;
      }
    });

    const report = {
      month: new Date().toLocaleString("default", { month: "long" }),
      totalStudy: Math.round(totalStudy * 10) / 10,
      avgMonk: Math.round(avgMonk),
      totalXP,
      completedDays,
      strongestSubject,
      weakestSubject,
      summary: `Month ${new Date().toLocaleString("default", { month: "long" })}: ${completedDays}/30 days completed. Avg Monk: ${Math.round(
        avgMonk
      )}.`,
    };

    return report;
  }, []);

  const detectPatterns = useCallback((data) => {
    if (!data) return [];
    const logs = data.dailyLogs.filter((l) => l.isLocked && !l.isRecoveredDay);
    if (logs.length < 7) return [];

    const patterns = [];
    const last14 = logs.slice(-14);

    const sundays = last14.filter((l) => isSunday(new Date(l.date)));
    const weekdays = last14.filter((l) => !isSunday(new Date(l.date)));
    if (sundays.length > 0 && weekdays.length > 0) {
      const avgSunday = sundays.reduce((acc, l) => acc + l.studyHours, 0) / sundays.length;
      const avgWeekday = weekdays.reduce((acc, l) => acc + l.studyHours, 0) / weekdays.length;
      if (avgSunday < avgWeekday * 0.5) {
        patterns.push("Sunday study drop detected. Try to maintain consistency on weekends.");
      }
    }

    const dopamineFailures = last14.filter((l) => !l.protocols.dopamineControl).length;
    if (dopamineFailures > 5) {
      patterns.push("Dopamine Control is frequently missed. Consider reducing social media usage.");
    }

    const deepWorkDays = last14.filter((l) => l.deepWorkSessions >= 2).length;
    if (deepWorkDays < 7) {
      patterns.push("Deep Work sessions are inconsistent. Aim for at least 2 sessions daily.");
    }

    return patterns;
  }, []);

  const generateInsights = useCallback((data, todayLog, currentDay) => {
    if (!data) return;

    const daily = generateDailyInsight(data, todayLog);
    setDailyInsight(daily);

    const weekly = generateWeeklyReport(data, currentDay);
    setWeeklyInsight(weekly);

    const monthly = generateMonthlyReport(data);
    setMonthlyInsight(monthly);

    const detected = detectPatterns(data);
    setPatterns(detected);
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

  return {
    dailyInsight,
    weeklyInsight,
    monthlyInsight,
    patterns,
    generateInsights,
    getEmergencyMessage,
  };
};

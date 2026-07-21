// ============================================
// UTILS / MATHUTILS.JS
// DISCIPLINEOS — XP, MONK SCORE, RANK ENGINE
// ============================================

import {
  MAX_STUDY_HOURS_COUNTED,
  MAX_DEEP_WORK_SESSIONS,
  XP_WEIGHTS,
  MONK_WEIGHTS,
  RANKS,
  CONSISTENCY_BONUSES,
} from "../constants";

export const calculateStudyXP = (hours) => {
  const capped = Math.min(hours, MAX_STUDY_HOURS_COUNTED);
  return Math.round((capped / MAX_STUDY_HOURS_COUNTED) * XP_WEIGHTS.study.max);
};

export const calculateDeepWorkXP = (sessions) => {
  const capped = Math.min(sessions, MAX_DEEP_WORK_SESSIONS);
  return capped * XP_WEIGHTS.deepWork.perSession;
};

export const calculateProtocolXP = (protocols) => {
  const count = Object.values(protocols).filter((v) => v === true).length;
  return count * XP_WEIGHTS.protocols.perProtocol;
};

export const calculateMockTestXP = (score) => {
  if (score === null || score === undefined) return 0;
  const thresholds = XP_WEIGHTS.mockTest.thresholds;
  for (const t of thresholds) {
    if (score >= t.min && score <= t.max) return t.xp;
  }
  return 0;
};

export const calculateMonkScore = ({
  studyHours,
  deepWorkSessions,
  protocols,
  mockTestScore,
  isSunday,
}) => {
  const cappedStudy = Math.min(studyHours, MAX_STUDY_HOURS_COUNTED);
  const cappedDeep = Math.min(deepWorkSessions, MAX_DEEP_WORK_SESSIONS);
  const protocolCount = Object.values(protocols).filter((v) => v === true).length;
  const protocolRatio = protocolCount / 4;

  let studyRatio = cappedStudy / MAX_STUDY_HOURS_COUNTED;
  let deepRatio = cappedDeep / MAX_DEEP_WORK_SESSIONS;
  let mockRatio = 0;

  if (isSunday && mockTestScore !== null && mockTestScore !== undefined) {
    mockRatio = Math.min(mockTestScore / 100, 1);
  }

  let wStudy = MONK_WEIGHTS.study;
  let wDeep = MONK_WEIGHTS.deepWork;
  let wProtocol = MONK_WEIGHTS.protocols;
  let wMock = MONK_WEIGHTS.mockTest;

  if (!isSunday || mockTestScore === null || mockTestScore === undefined) {
    const totalNonMockWeight = wStudy + wDeep + wProtocol;
    if (totalNonMockWeight > 0) {
      const scale = 1 / totalNonMockWeight;
      wStudy = wStudy * scale;
      wDeep = wDeep * scale;
      wProtocol = wProtocol * scale;
      wMock = 0;
    } else {
      wStudy = 0.5;
      wDeep = 0.25;
      wProtocol = 0.25;
      wMock = 0;
    }
  }

  let score =
    studyRatio * wStudy * 100 +
    deepRatio * wDeep * 100 +
    protocolRatio * wProtocol * 100 +
    mockRatio * wMock * 100;

  score = Math.round(Math.min(Math.max(score, 0), 100));
  return score;
};

export const getMonkScoreDetails = (score) => {
  const levels = [
    { min: 95, max: 100, label: "Legendary Day", color: "emerald" },
    { min: 90, max: 94, label: "Exceptional Day", color: "blue" },
    { min: 80, max: 89, label: "Strong Day", color: "cyan" },
    { min: 70, max: 79, label: "Good Day", color: "amber" },
    { min: 60, max: 69, label: "Steady Day", color: "orange" },
    { min: 40, max: 59, label: "Needs Improvement", color: "orange" },
    { min: 0, max: 39, label: "Recovery Needed", color: "red" },
  ];
  for (const level of levels) {
    if (score >= level.min && score <= level.max) {
      return { label: level.label, color: level.color };
    }
  }
  return { label: "Unknown", color: "gray" };
};

export const calculateDailyXP = ({
  studyHours,
  deepWorkSessions,
  protocols,
  mockTestScore,
  isSunday,
}) => {
  const studyXP = calculateStudyXP(studyHours);
  const deepXP = calculateDeepWorkXP(deepWorkSessions);
  const protocolXP = calculateProtocolXP(protocols);
  const mockXP = isSunday ? calculateMockTestXP(mockTestScore) : 0;

  let total = studyXP + deepXP + protocolXP + mockXP;

  if (!isSunday || mockTestScore === null || mockTestScore === undefined) {
    const baseMax = 80;
    if (baseMax > 0) {
      const scale = 100 / baseMax;
      total = Math.round(total * scale);
    }
  }

  total = Math.min(total, 100);
  return total;
};

export const calculateConsistencyBonus = (streakCount) => {
  let bonus = 0;
  for (const b of CONSISTENCY_BONUSES) {
    if (streakCount >= b.streak) {
      bonus = b.xp;
    }
  }
  return bonus;
};

export const calculateConsistency = ({ totalDaysCompleted, totalElapsedDays }) => {
  if (totalElapsedDays === 0) return 0;
  return Math.round((totalDaysCompleted / totalElapsedDays) * 100);
};

export const getCurrentRank = ({
  totalXP,
  avgMonkScore,
  consistencyPercent,
  totalDaysCompleted,
  infiniteModeUnlocked,
}) => {
  let eligibleRank = RANKS[0];

  for (const rank of RANKS) {
    if (rank.id === "S" && totalDaysCompleted < 200) continue;
    if (rank.id === "LEGEND" && !infiniteModeUnlocked) continue;

    if (
      totalXP >= rank.minXP &&
      avgMonkScore >= rank.minMonk &&
      consistencyPercent >= rank.minConsistency
    ) {
      eligibleRank = rank;
    }
  }
  return eligibleRank;
};

export const getHeatmapColorClass = (monkScore, isRecovered = false) => {
  if (isRecovered) return "bg-discipline-purple";
  if (monkScore >= 95) return "bg-discipline-emerald";
  if (monkScore >= 80) return "bg-discipline-blue";
  if (monkScore >= 65) return "bg-discipline-cyan";
  if (monkScore >= 50) return "bg-discipline-amber";
  if (monkScore >= 25) return "bg-discipline-orange";
  return "bg-discipline-red";
};

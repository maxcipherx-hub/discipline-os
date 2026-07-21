// ============================================
// UTILS / DATEUTILS.JS
// DISCIPLINEOS — DATE & TIME ENGINE
// ============================================

import { CHALLENGE_START_DATE, CHALLENGE_DURATION_DAYS } from "../constants";

export const getTodayMidnight = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const getChallengeStartMidnight = () => {
  return new Date(
    CHALLENGE_START_DATE.getFullYear(),
    CHALLENGE_START_DATE.getMonth(),
    CHALLENGE_START_DATE.getDate()
  );
};

export const getCurrentChallengeDay = () => {
  const today = getTodayMidnight();
  const start = getChallengeStartMidnight();
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 0;
  if (diffDays >= CHALLENGE_DURATION_DAYS) {
    return CHALLENGE_DURATION_DAYS + (diffDays - CHALLENGE_DURATION_DAYS) + 1;
  }
  return diffDays + 1;
};

export const hasChallengeStarted = () => {
  return getCurrentChallengeDay() > 0;
};

export const isInfiniteMode = () => {
  return getCurrentChallengeDay() > CHALLENGE_DURATION_DAYS;
};

export const getFormattedDate = (date = new Date()) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getISODate = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export const isToday = (dateISO) => {
  return dateISO === getISODate(new Date());
};

export const isSunday = (date = new Date()) => {
  return date.getDay() === 0;
};

export const isMidnight = () => {
  const now = new Date();
  return now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 30;
};

export const getDaysBetween = (date1ISO, date2ISO) => {
  const d1 = new Date(date1ISO);
  const d2 = new Date(date2ISO);
  const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
};

export const getChallengeWeekNumber = (dayNumber) => {
  if (dayNumber <= 0) return 0;
  return Math.ceil(dayNumber / 7);
};

export const isChallengeDaySunday = (dayNumber) => {
  if (dayNumber <= 0) return false;
  const start = getChallengeStartMidnight();
  const targetDate = new Date(start);
  targetDate.setDate(start.getDate() + (dayNumber - 1));
  return isSunday(targetDate);
};

import { subDays } from "date-fns";
import { prisma } from "@/server/db";
import { toDateKey, toPrismaDate, fromPrismaDate, nowInAppTimezone } from "@/domain/date";
import {
  computeAcwr,
  computeDailyLoad,
  computeMonotony,
  dailyLoadSeries,
} from "@/domain/insights/training-load";
import { average } from "@/domain/insights/trend";
import { compareSleepAndRunningPerformance } from "@/domain/insights/sleep-performance";
import { generateInsights } from "@/domain/insights/generate";
import { currentStreak } from "@/domain/streak";
import type { Insight } from "@/domain/insights/types";

const TREND_WINDOW_DAYS = 35;
const RECENT_WINDOW_DAYS = 7;

export async function computeInsights(): Promise<Insight[]> {
  const today = nowInAppTimezone();
  const sevenDaysAgo = subDays(today, RECENT_WINDOW_DAYS);
  const trendStart = subDays(today, TREND_WINDOW_DAYS);

  const [allLogs, runningLogs, sleepLogs, foodLogs, bodyMetric, completedDates] =
    await Promise.all([
      prisma.workoutLog.findMany({
        where: { completedAt: { gte: subDays(today, 28) } },
        select: { completedAt: true, durationMinutes: true, calories: true },
      }),
      prisma.workoutLog.findMany({
        where: { category: "RUNNING", completedAt: { gte: trendStart } },
        select: { completedAt: true, paceSecPerKm: true, avgHeartRate: true },
      }),
      prisma.sleepLog.findMany({
        where: { date: { gte: toPrismaDate(trendStart) } },
        select: { date: true, totalHours: true },
      }),
      prisma.foodLog.findMany({
        where: { date: { gte: toPrismaDate(sevenDaysAgo) } },
        select: { date: true, calories: true, protein: true },
      }),
      prisma.bodyMetricLog.findFirst({
        where: { weightKg: { not: null } },
        orderBy: { date: "desc" },
      }),
      prisma.plannedWorkout.findMany({
        where: { status: "COMPLETED", date: { gte: toPrismaDate(subDays(today, 60)) } },
        select: { date: true },
      }),
    ]);

  // --- Carga / ACWR / monotonia ---
  const dailyLoads = computeDailyLoad(
    allLogs.map((l) => ({ date: l.completedAt, durationMinutes: l.durationMinutes })),
  );
  const acwr = computeAcwr(dailyLoads, today);
  const monotony = computeMonotony(dailyLoadSeries(dailyLoads, 7, today));

  // --- Pace / FC de corrida: semana atual vs 4 semanas anteriores ---
  const thisWeekRuns = runningLogs.filter((l) => l.completedAt >= sevenDaysAgo);
  const baselineRuns = runningLogs.filter((l) => l.completedAt < sevenDaysAgo);

  const notNull = <T,>(v: T | null): v is T => v !== null;

  const pace = {
    thisWeek: average(thisWeekRuns.map((l) => l.paceSecPerKm).filter(notNull)),
    last4Weeks: average(baselineRuns.map((l) => l.paceSecPerKm).filter(notNull)),
  };
  const heartRate = {
    thisWeek: average(thisWeekRuns.map((l) => l.avgHeartRate).filter(notNull)),
    last4Weeks: average(baselineRuns.map((l) => l.avgHeartRate).filter(notNull)),
  };

  // --- Sono: semana atual vs 4 semanas anteriores ---
  const sleepByDate = new Map<string, number>();
  for (const log of sleepLogs) {
    sleepByDate.set(toDateKey(fromPrismaDate(log.date)), log.totalHours);
  }
  const thisWeekSleep = sleepLogs.filter((l) => fromPrismaDate(l.date) >= sevenDaysAgo);
  const baselineSleep = sleepLogs.filter((l) => fromPrismaDate(l.date) < sevenDaysAgo);
  const sleep = {
    thisWeek: average(thisWeekSleep.map((l) => l.totalHours)),
    last4Weeks: average(baselineSleep.map((l) => l.totalHours)),
  };

  // --- Sono x desempenho: pareia cada corrida com o sono da noite anterior ---
  const sessionsWithPriorSleep = runningLogs.map((l) => {
    const sessionDateKey = toDateKey(l.completedAt);
    const priorNightKey = toDateKey(subDays(l.completedAt, 1));
    return {
      dateKey: sessionDateKey,
      paceSecPerKm: l.paceSecPerKm,
      avgHeartRate: l.avgHeartRate,
      priorNightHours: sleepByDate.get(priorNightKey) ?? null,
    };
  });
  const sleepPerformance = compareSleepAndRunningPerformance(sessionsWithPriorSleep);

  // --- Nutricao: media diaria dos ultimos 7 dias ---
  const proteinByDate = new Map<string, number>();
  const caloriesByDate = new Map<string, number>();
  for (const log of foodLogs) {
    const key = toDateKey(fromPrismaDate(log.date));
    proteinByDate.set(key, (proteinByDate.get(key) ?? 0) + log.protein);
    caloriesByDate.set(key, (caloriesByDate.get(key) ?? 0) + log.calories);
  }
  const avgProteinG = average(Array.from(proteinByDate.values()));
  const avgCaloriesIntake = average(Array.from(caloriesByDate.values()));

  const trainingCaloriesLast7 = allLogs
    .filter((l) => l.completedAt >= sevenDaysAgo)
    .map((l) => l.calories)
    .filter(notNull);

  const streak = currentStreak(
    completedDates.map((w) => toDateKey(fromPrismaDate(w.date))),
    toDateKey(today),
  );

  return generateInsights({
    acwr,
    monotony,
    pace,
    heartRate,
    sleep,
    sleepPerformance,
    nutrition: {
      avgProteinG,
      avgCaloriesIntake,
      avgTrainingCalories: average(trainingCaloriesLast7),
      weightKg: bodyMetric?.weightKg ?? null,
    },
    streak,
  });
}

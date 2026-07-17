import { subDays } from "date-fns";
import { prisma } from "@/server/db";
import { toPrismaDate } from "@/domain/date";
import { getWeekEnd, getWeekStart } from "@/domain/workouts/week";
import { bucketWeeklyVolume, lastNWeekStarts } from "@/domain/stats/weekly-volume";

export async function getWeeklyVolumeChartData(weeks: number) {
  const weekStarts = lastNWeekStarts(weeks);
  const rangeStart = toPrismaDate(weekStarts[0]);

  const logs = await prisma.workoutLog.findMany({
    where: { completedAt: { gte: rangeStart } },
    select: { completedAt: true, category: true, durationMinutes: true },
  });

  return bucketWeeklyVolume(logs, weekStarts);
}

export async function getCurrentWeekPlannedWorkouts() {
  const weekStart = getWeekStart(new Date());
  const weekEnd = getWeekEnd(new Date());

  return prisma.plannedWorkout.findMany({
    where: {
      date: { gte: toPrismaDate(weekStart), lte: toPrismaDate(weekEnd) },
    },
    include: { template: true, workoutLog: true },
    orderBy: [{ date: "asc" }, { order: "asc" }],
  });
}

export async function getTodayPlannedWorkouts() {
  const today = toPrismaDate(new Date());
  return prisma.plannedWorkout.findMany({
    where: { date: today },
    include: { template: true },
    orderBy: { order: "asc" },
  });
}

export function getRecentWorkoutLogs(limit: number) {
  return prisma.workoutLog.findMany({
    orderBy: { completedAt: "desc" },
    take: limit,
    include: { plannedWorkout: { include: { template: true } } },
  });
}

export async function getRunningTrend(limit: number) {
  const logs = await prisma.workoutLog.findMany({
    where: { category: "RUNNING" },
    orderBy: { completedAt: "desc" },
    take: limit,
    select: { completedAt: true, paceSecPerKm: true, avgHeartRate: true, distanceKm: true },
  });
  return logs.reverse();
}

export async function getHeartRateTrend(limit: number) {
  const logs = await prisma.workoutLog.findMany({
    where: { avgHeartRate: { not: null } },
    orderBy: { completedAt: "desc" },
    take: limit,
    select: { completedAt: true, avgHeartRate: true, category: true },
  });
  return logs.reverse();
}

export async function getNutritionTrend(days: number) {
  const start = toPrismaDate(subDays(new Date(), days - 1));
  const logs = await prisma.foodLog.findMany({
    where: { date: { gte: start } },
    select: { date: true, calories: true, protein: true, carbs: true, fat: true },
  });

  const byDate = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();
  for (const log of logs) {
    const key = log.date.toISOString().slice(0, 10);
    const acc = byDate.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    acc.calories += log.calories;
    acc.protein += log.protein;
    acc.carbs += log.carbs;
    acc.fat += log.fat;
    byDate.set(key, acc);
  }
  return byDate;
}

export async function getSleepTrend(days: number) {
  const start = toPrismaDate(subDays(new Date(), days - 1));
  return prisma.sleepLog.findMany({
    where: { date: { gte: start } },
    orderBy: { date: "asc" },
    select: { date: true, totalHours: true, quality: true },
  });
}

export async function getTrainingHeatmap(days: number) {
  const start = toPrismaDate(subDays(new Date(), days - 1));
  const logs = await prisma.workoutLog.findMany({
    where: { completedAt: { gte: start } },
    select: { completedAt: true },
  });

  const counts = new Map<string, number>();
  for (const log of logs) {
    const key = log.completedAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

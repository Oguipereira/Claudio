import { prisma } from "@/server/db";
import { parseDateKey, toPrismaDate } from "@/domain/date";
import type { LogBodyMetricInput } from "@/domain/body-metrics/schemas";

export function upsertBodyMetricLog(input: LogBodyMetricInput) {
  const date = toPrismaDate(parseDateKey(input.date));
  return prisma.bodyMetricLog.upsert({
    where: { date },
    update: {
      weightKg: input.weightKg,
      restingHeartRate: input.restingHeartRate,
      notes: input.notes,
    },
    create: {
      date,
      weightKg: input.weightKg,
      restingHeartRate: input.restingHeartRate,
      notes: input.notes,
    },
  });
}

export function getLatestBodyMetric() {
  return prisma.bodyMetricLog.findFirst({
    where: { weightKg: { not: null } },
    orderBy: { date: "desc" },
  });
}

export function listRecentBodyMetrics(days: number) {
  return prisma.bodyMetricLog.findMany({
    orderBy: { date: "desc" },
    take: days,
  });
}

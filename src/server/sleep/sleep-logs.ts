import { prisma } from "@/server/db";
import { parseDateKey, toPrismaDate } from "@/domain/date";
import { computeSleepSession } from "@/domain/sleep/session";
import type { LogSleepInput } from "@/domain/sleep/schemas";

export function upsertSleepLog(input: LogSleepInput) {
  const { sleepAt, wakeAt, totalHours } = computeSleepSession(
    input.date,
    input.sleepTime,
    input.wakeTime,
  );
  const date = toPrismaDate(parseDateKey(input.date));

  return prisma.sleepLog.upsert({
    where: { date },
    update: { sleepAt, wakeAt, totalHours, quality: input.quality, notes: input.notes },
    create: {
      date,
      sleepAt,
      wakeAt,
      totalHours,
      quality: input.quality,
      notes: input.notes,
    },
  });
}

export function listRecentSleepLogs(days: number) {
  return prisma.sleepLog.findMany({
    orderBy: { date: "desc" },
    take: days,
  });
}

export function listSleepLogsInRange(start: Date, end: Date) {
  return prisma.sleepLog.findMany({
    where: { date: { gte: toPrismaDate(start), lte: toPrismaDate(end) } },
    orderBy: { date: "asc" },
  });
}

export function deleteSleepLog(id: string) {
  return prisma.sleepLog.delete({ where: { id } });
}

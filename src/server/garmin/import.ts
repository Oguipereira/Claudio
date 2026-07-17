import { prisma } from "@/server/db";
import { toPrismaDate } from "@/domain/date";
import type { ParsedGarminActivity } from "@/domain/garmin/csv-parser";

export type ImportSummary = {
  imported: number;
  skipped: number;
  linked: number;
};

export async function importGarminActivities(
  activities: ParsedGarminActivity[],
): Promise<ImportSummary> {
  let imported = 0;
  let skipped = 0;
  let linked = 0;

  for (const activity of activities) {
    const existing = await prisma.garminActivity.findUnique({
      where: { externalId: activity.externalId },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const created = await prisma.garminActivity.create({
      data: {
        externalId: activity.externalId,
        date: activity.date,
        activityType: activity.activityType,
        durationMinutes: activity.durationMinutes,
        distanceKm: activity.distanceKm,
        avgHeartRate: activity.avgHeartRate,
        maxHeartRate: activity.maxHeartRate,
        paceSecPerKm: activity.paceSecPerKm,
        calories: activity.calories,
        steps: activity.steps,
        cadence: activity.cadence,
        rawData: activity.rawData,
      },
    });
    imported++;

    const dayStart = toPrismaDate(activity.date);
    const candidates = await prisma.plannedWorkout.findMany({
      where: { date: dayStart, workoutLog: { isNot: null } },
      include: { workoutLog: { include: { garminActivity: true } } },
    });
    const unlinked = candidates.filter(
      (c) => c.workoutLog && !c.workoutLog.garminActivity,
    );

    if (unlinked.length === 1 && unlinked[0].workoutLog) {
      await prisma.garminActivity.update({
        where: { id: created.id },
        data: { workoutLogId: unlinked[0].workoutLog.id },
      });
      linked++;
    }
  }

  return { imported, skipped, linked };
}

export function listRecentGarminActivities(take = 30) {
  return prisma.garminActivity.findMany({
    orderBy: { date: "desc" },
    take,
  });
}

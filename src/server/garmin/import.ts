import { prisma } from "@/server/db";
import { toPrismaDate } from "@/domain/date";
import { inferWorkoutCategory, type ParsedGarminActivity } from "@/domain/garmin/csv-parser";

export type ImportSummary = {
  imported: number;
  skipped: number;
  linked: number;
  createdWorkouts: number;
};

export async function importGarminActivities(
  activities: ParsedGarminActivity[],
): Promise<ImportSummary> {
  let imported = 0;
  let skipped = 0;
  let linked = 0;
  let createdWorkouts = 0;

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
      continue;
    }

    // Nenhum treino manual correspondente: a atividade importada vira um
    // treino concluido de verdade, para alimentar o historico e os
    // dashboards automaticamente (e nao so uma lista isolada em /garmin).
    if (unlinked.length === 0) {
      const category = inferWorkoutCategory(activity.activityType);
      const plannedWorkout = await prisma.plannedWorkout.create({
        data: {
          date: dayStart,
          category,
          status: "COMPLETED",
          adHocLabel: activity.title ?? activity.activityType,
          notes: "Importado automaticamente do Garmin Connect.",
        },
      });
      const workoutLog = await prisma.workoutLog.create({
        data: {
          plannedWorkoutId: plannedWorkout.id,
          category,
          completedAt: activity.date,
          durationMinutes: activity.durationMinutes,
          avgHeartRate: activity.avgHeartRate,
          maxHeartRate: activity.maxHeartRate,
          calories: activity.calories,
          distanceKm: activity.distanceKm,
          paceSecPerKm: activity.paceSecPerKm,
          cadence: activity.cadence,
          notes: "Importado automaticamente do Garmin Connect.",
        },
      });
      await prisma.garminActivity.update({
        where: { id: created.id },
        data: { workoutLogId: workoutLog.id },
      });
      createdWorkouts++;
    }
  }

  return { imported, skipped, linked, createdWorkouts };
}

export function listRecentGarminActivities(take = 30) {
  return prisma.garminActivity.findMany({
    orderBy: { date: "desc" },
    take,
  });
}

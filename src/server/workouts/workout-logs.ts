import { prisma } from "@/server/db";
import { parsePaceToSeconds } from "@/domain/workouts/pace";
import type { LogWorkoutInput } from "@/domain/workouts/schemas";
import type { WorkoutCategory } from "@/generated/prisma/client";

export function getPlannedWorkoutForLogging(id: string) {
  return prisma.plannedWorkout.findUnique({
    where: { id },
    include: { template: true, workoutLog: true },
  });
}

export class InvalidPaceError extends Error {}

export async function completeWorkout(input: LogWorkoutInput) {
  let paceSecPerKm: number | undefined;
  if (input.pace) {
    const parsed = parsePaceToSeconds(input.pace);
    if (parsed === null) {
      throw new InvalidPaceError("Ritmo invalido, use o formato mm:ss.");
    }
    paceSecPerKm = parsed;
  }

  const plannedWorkout = await prisma.plannedWorkout.findUniqueOrThrow({
    where: { id: input.plannedWorkoutId },
  });

  return prisma.$transaction([
    prisma.workoutLog.create({
      data: {
        plannedWorkoutId: input.plannedWorkoutId,
        category: plannedWorkout.category,
        durationMinutes: input.durationMinutes,
        avgHeartRate: input.avgHeartRate,
        maxHeartRate: input.maxHeartRate,
        calories: input.calories,
        distanceKm: input.distanceKm,
        paceSecPerKm,
        cadence: input.cadence,
        notes: input.notes,
      },
    }),
    prisma.plannedWorkout.update({
      where: { id: input.plannedWorkoutId },
      data: { status: "COMPLETED" },
    }),
  ]);
}

export async function deleteWorkoutLog(id: string) {
  const log = await prisma.workoutLog.findUniqueOrThrow({ where: { id } });
  return prisma.$transaction([
    prisma.workoutLog.delete({ where: { id } }),
    prisma.plannedWorkout.update({
      where: { id: log.plannedWorkoutId },
      data: { status: "PLANNED" },
    }),
  ]);
}

export function listWorkoutLogs(category?: WorkoutCategory) {
  return prisma.workoutLog.findMany({
    where: category ? { category } : undefined,
    include: { plannedWorkout: { include: { template: true } } },
    orderBy: { completedAt: "desc" },
    take: 100,
  });
}

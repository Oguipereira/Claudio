import { prisma } from "@/server/db";
import { toPrismaDate } from "@/domain/workouts/week";
import type {
  CreatePlannedWorkoutInput,
  UpdatePlannedWorkoutInput,
} from "@/domain/workouts/schemas";
import { parseDateKey } from "@/domain/workouts/week";

export function listPlannedWorkoutsInRange(weekStart: Date, weekEnd: Date) {
  return prisma.plannedWorkout.findMany({
    where: {
      date: {
        gte: toPrismaDate(weekStart),
        lte: toPrismaDate(weekEnd),
      },
    },
    include: { template: true, workoutLog: true },
    orderBy: [{ date: "asc" }, { order: "asc" }],
  });
}

export async function createPlannedWorkout(input: CreatePlannedWorkoutInput) {
  const date = toPrismaDate(parseDateKey(input.date));

  const lastInDay = await prisma.plannedWorkout.findFirst({
    where: { date },
    orderBy: { order: "desc" },
  });

  return prisma.plannedWorkout.create({
    data: {
      date,
      category: input.category,
      templateId: input.templateId,
      adHocLabel: input.adHocLabel,
      notes: input.notes,
      order: (lastInDay?.order ?? -1) + 1,
    },
  });
}

export function updatePlannedWorkout(input: UpdatePlannedWorkoutInput) {
  return prisma.plannedWorkout.update({
    where: { id: input.id },
    data: {
      ...(input.date ? { date: toPrismaDate(parseDateKey(input.date)) } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
  });
}

export function deletePlannedWorkout(id: string) {
  return prisma.plannedWorkout.delete({ where: { id } });
}

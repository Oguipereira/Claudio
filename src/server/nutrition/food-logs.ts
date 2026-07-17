import { prisma } from "@/server/db";
import { computeMacrosForGrams } from "@/domain/nutrition/macros";
import { parseDateKey, toPrismaDate } from "@/domain/date";
import type { LogFoodInput } from "@/domain/nutrition/schemas";

export async function createFoodLog(input: LogFoodInput) {
  const foodItem = await prisma.foodItem.findUniqueOrThrow({
    where: { id: input.foodItemId },
  });

  const macros = computeMacrosForGrams(foodItem, input.grams);

  return prisma.foodLog.create({
    data: {
      foodItemId: input.foodItemId,
      date: toPrismaDate(parseDateKey(input.date)),
      mealType: input.mealType,
      grams: input.grams,
      time: input.time
        ? new Date(`${input.date}T${input.time}:00`)
        : undefined,
      notes: input.notes,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,
    },
  });
}

export function listFoodLogsForDate(date: Date) {
  return prisma.foodLog.findMany({
    where: { date: toPrismaDate(date) },
    include: { foodItem: true },
    orderBy: { createdAt: "asc" },
  });
}

export function listFoodLogsInRange(start: Date, end: Date) {
  return prisma.foodLog.findMany({
    where: { date: { gte: toPrismaDate(start), lte: toPrismaDate(end) } },
    include: { foodItem: true },
    orderBy: { date: "asc" },
  });
}

export function deleteFoodLog(id: string) {
  return prisma.foodLog.delete({ where: { id } });
}

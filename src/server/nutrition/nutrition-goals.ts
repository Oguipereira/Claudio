import { addDays } from "date-fns";
import { prisma } from "@/server/db";
import { toPrismaDate } from "@/domain/date";
import type { SetNutritionGoalInput } from "@/domain/nutrition/schemas";

export function getCurrentNutritionGoal() {
  return prisma.nutritionGoal.findFirst({
    where: { endDate: null },
    orderBy: { startDate: "desc" },
  });
}

export async function setNutritionGoal(input: SetNutritionGoalInput) {
  const today = toPrismaDate(new Date());

  const current = await getCurrentNutritionGoal();
  if (current) {
    await prisma.nutritionGoal.update({
      where: { id: current.id },
      data: { endDate: toPrismaDate(addDays(new Date(), -1)) },
    });
  }

  return prisma.nutritionGoal.create({
    data: {
      startDate: today,
      caloriesTarget: input.caloriesTarget,
      proteinTarget: input.proteinTarget,
      carbsTarget: input.carbsTarget,
      fatTarget: input.fatTarget,
    },
  });
}

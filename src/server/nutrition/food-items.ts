import { prisma } from "@/server/db";
import type { CreateCustomFoodInput } from "@/domain/nutrition/schemas";
import type { FoodSearchResult } from "./food-search";

export function searchCachedFoodItems(query: string) {
  return prisma.foodItem.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 10,
  });
}

export function upsertFoodItemFromSearch(result: FoodSearchResult) {
  return prisma.foodItem.upsert({
    where: {
      source_externalId: {
        source: result.source,
        externalId: result.externalId,
      },
    },
    update: {
      name: result.name,
      caloriesPer100g: result.caloriesPer100g,
      proteinPer100g: result.proteinPer100g,
      carbsPer100g: result.carbsPer100g,
      fatPer100g: result.fatPer100g,
      fiberPer100g: result.fiberPer100g,
    },
    create: {
      source: result.source,
      externalId: result.externalId,
      name: result.name,
      caloriesPer100g: result.caloriesPer100g,
      proteinPer100g: result.proteinPer100g,
      carbsPer100g: result.carbsPer100g,
      fatPer100g: result.fatPer100g,
      fiberPer100g: result.fiberPer100g,
    },
  });
}

export function createCustomFoodItem(input: CreateCustomFoodInput) {
  return prisma.foodItem.create({
    data: {
      source: "CUSTOM",
      name: input.name,
      caloriesPer100g: input.caloriesPer100g,
      proteinPer100g: input.proteinPer100g,
      carbsPer100g: input.carbsPer100g,
      fatPer100g: input.fatPer100g,
      fiberPer100g: input.fiberPer100g,
    },
  });
}

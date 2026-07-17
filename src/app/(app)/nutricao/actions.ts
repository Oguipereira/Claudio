"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomFoodSchema,
  logFoodSchema,
  setNutritionGoalSchema,
} from "@/domain/nutrition/schemas";
import {
  createCustomFoodItem,
  searchCachedFoodItems,
  upsertFoodItemFromSearch,
} from "@/server/nutrition/food-items";
import { searchFoods, type FoodSearchResult } from "@/server/nutrition/food-search";
import { createFoodLog, deleteFoodLog } from "@/server/nutrition/food-logs";
import { setNutritionGoal } from "@/server/nutrition/nutrition-goals";

export type ActionState = { error?: string };

export async function searchFoodsAction(query: string) {
  if (query.trim().length < 2) return { cached: [], remote: [] };

  const [cached, remote] = await Promise.all([
    searchCachedFoodItems(query),
    searchFoods(query),
  ]);

  const cachedKeys = new Set(cached.map((f) => `${f.source}:${f.externalId}`));
  const dedupedRemote = remote.filter(
    (r: FoodSearchResult) => !cachedKeys.has(`${r.source}:${r.externalId}`),
  );

  return { cached, remote: dedupedRemote };
}

export async function logFoodFromSearchAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const source = formData.get("source") as string;
  const externalId = formData.get("externalId") as string;
  const name = formData.get("name") as string;

  let foodItemId = formData.get("foodItemId") as string | null;

  if (!foodItemId && source && externalId && name) {
    const item = await upsertFoodItemFromSearch({
      source: source as FoodSearchResult["source"],
      externalId,
      name,
      caloriesPer100g: Number(formData.get("caloriesPer100g")),
      proteinPer100g: Number(formData.get("proteinPer100g")),
      carbsPer100g: Number(formData.get("carbsPer100g")),
      fatPer100g: Number(formData.get("fatPer100g")),
      fiberPer100g: formData.get("fiberPer100g")
        ? Number(formData.get("fiberPer100g"))
        : undefined,
    });
    foodItemId = item.id;
  }

  const parsed = logFoodSchema.safeParse({
    foodItemId,
    date: formData.get("date"),
    mealType: formData.get("mealType"),
    grams: formData.get("grams"),
    time: formData.get("time") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Dados invalidos para o registro do alimento." };
  }

  await createFoodLog(parsed.data);
  revalidatePath("/nutricao");
  return {};
}

export async function createCustomFoodAndLogAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsedFood = createCustomFoodSchema.safeParse({
    name: formData.get("name"),
    caloriesPer100g: formData.get("caloriesPer100g"),
    proteinPer100g: formData.get("proteinPer100g"),
    carbsPer100g: formData.get("carbsPer100g"),
    fatPer100g: formData.get("fatPer100g"),
    fiberPer100g: formData.get("fiberPer100g") || undefined,
  });

  if (!parsedFood.success) {
    return { error: "Dados invalidos para o alimento personalizado." };
  }

  const foodItem = await createCustomFoodItem(parsedFood.data);

  const parsedLog = logFoodSchema.safeParse({
    foodItemId: foodItem.id,
    date: formData.get("date"),
    mealType: formData.get("mealType"),
    grams: formData.get("grams"),
    time: formData.get("time") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsedLog.success) {
    return { error: "Dados invalidos para o registro do alimento." };
  }

  await createFoodLog(parsedLog.data);
  revalidatePath("/nutricao");
  return {};
}

export async function deleteFoodLogAction(id: string) {
  await deleteFoodLog(id);
  revalidatePath("/nutricao");
}

export async function setNutritionGoalAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = setNutritionGoalSchema.safeParse({
    caloriesTarget: formData.get("caloriesTarget"),
    proteinTarget: formData.get("proteinTarget"),
    carbsTarget: formData.get("carbsTarget"),
    fatTarget: formData.get("fatTarget"),
  });

  if (!parsed.success) {
    return { error: "Dados invalidos para as metas." };
  }

  await setNutritionGoal(parsed.data);
  revalidatePath("/nutricao");
  return {};
}

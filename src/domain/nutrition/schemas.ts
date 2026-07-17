import { z } from "zod";

export const mealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida");
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Horario invalido");

export const createCustomFoodSchema = z.object({
  name: z.string().min(1).max(120),
  caloriesPer100g: z.coerce.number().min(0),
  proteinPer100g: z.coerce.number().min(0),
  carbsPer100g: z.coerce.number().min(0),
  fatPer100g: z.coerce.number().min(0),
  fiberPer100g: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().min(0).optional(),
  ),
});

export const logFoodSchema = z.object({
  foodItemId: z.string().min(1),
  date: dateKeySchema,
  mealType: mealTypeSchema,
  grams: z.coerce.number().positive(),
  time: timeSchema.optional(),
  notes: z.string().max(500).optional(),
});

export const setNutritionGoalSchema = z.object({
  caloriesTarget: z.coerce.number().int().positive(),
  proteinTarget: z.coerce.number().int().positive(),
  carbsTarget: z.coerce.number().int().positive(),
  fatTarget: z.coerce.number().int().positive(),
});

export type CreateCustomFoodInput = z.infer<typeof createCustomFoodSchema>;
export type LogFoodInput = z.infer<typeof logFoodSchema>;
export type SetNutritionGoalInput = z.infer<typeof setNutritionGoalSchema>;

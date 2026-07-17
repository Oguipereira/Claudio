import { z } from "zod";

export const workoutCategorySchema = z.enum(["STRENGTH", "HYROX", "RUNNING"]);

export const plannedWorkoutStatusSchema = z.enum([
  "PLANNED",
  "COMPLETED",
  "RESCHEDULED",
  "CANCELLED",
]);

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida");

export const createPlannedWorkoutSchema = z.object({
  date: dateKeySchema,
  category: workoutCategorySchema,
  templateId: z.string().min(1).optional(),
  adHocLabel: z.string().min(1).max(120).optional(),
  notes: z.string().max(2000).optional(),
});

export const updatePlannedWorkoutSchema = z.object({
  id: z.string().min(1),
  date: dateKeySchema.optional(),
  status: plannedWorkoutStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
});

const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  return val;
}, z.coerce.number().optional());

export const logWorkoutSchema = z.object({
  plannedWorkoutId: z.string().min(1),
  durationMinutes: optionalNumber,
  avgHeartRate: optionalNumber,
  maxHeartRate: optionalNumber,
  calories: optionalNumber,
  distanceKm: optionalNumber,
  pace: z.string().optional(),
  cadence: optionalNumber,
  notes: z.string().max(2000).optional(),
});

export type CreatePlannedWorkoutInput = z.infer<
  typeof createPlannedWorkoutSchema
>;
export type UpdatePlannedWorkoutInput = z.infer<
  typeof updatePlannedWorkoutSchema
>;
export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;

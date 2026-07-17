"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logWorkoutSchema } from "@/domain/workouts/schemas";
import {
  InvalidPaceError,
  completeWorkout,
  deleteWorkoutLog,
} from "@/server/workouts/workout-logs";

export type LogWorkoutState = { error?: string };

export async function completeWorkoutAction(
  _prevState: LogWorkoutState,
  formData: FormData,
): Promise<LogWorkoutState> {
  const parsed = logWorkoutSchema.safeParse({
    plannedWorkoutId: formData.get("plannedWorkoutId"),
    durationMinutes: formData.get("durationMinutes"),
    avgHeartRate: formData.get("avgHeartRate"),
    maxHeartRate: formData.get("maxHeartRate"),
    calories: formData.get("calories"),
    distanceKm: formData.get("distanceKm"),
    pace: formData.get("pace") || undefined,
    cadence: formData.get("cadence"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Dados invalidos para o registro do treino." };
  }

  try {
    await completeWorkout(parsed.data);
  } catch (err) {
    if (err instanceof InvalidPaceError) {
      return { error: err.message };
    }
    return { error: "Nao foi possivel salvar o treino." };
  }

  revalidatePath("/planejamento");
  revalidatePath("/treinos");
  redirect("/treinos");
}

export async function deleteWorkoutLogAction(id: string) {
  await deleteWorkoutLog(id);
  revalidatePath("/planejamento");
  revalidatePath("/treinos");
}

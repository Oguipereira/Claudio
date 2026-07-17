"use server";

import { revalidatePath } from "next/cache";
import {
  createPlannedWorkoutSchema,
  updatePlannedWorkoutSchema,
} from "@/domain/workouts/schemas";
import {
  createPlannedWorkout,
  deletePlannedWorkout,
  updatePlannedWorkout,
} from "@/server/workouts/planned-workouts";

export type ActionState = { error?: string };

export async function addPlannedWorkoutAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createPlannedWorkoutSchema.safeParse({
    date: formData.get("date"),
    category: formData.get("category"),
    templateId: formData.get("templateId") || undefined,
    adHocLabel: formData.get("adHocLabel") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Dados invalidos para o treino." };
  }

  if (!parsed.data.templateId && !parsed.data.adHocLabel) {
    return { error: "Selecione um modelo ou informe um nome para o treino." };
  }

  await createPlannedWorkout(parsed.data);
  revalidatePath("/planejamento");
  return {};
}

export async function updatePlannedWorkoutAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePlannedWorkoutSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date") || undefined,
    status: formData.get("status") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Dados invalidos para atualizar o treino." };
  }

  await updatePlannedWorkout(parsed.data);
  revalidatePath("/planejamento");
  return {};
}

export async function deletePlannedWorkoutAction(id: string) {
  await deletePlannedWorkout(id);
  revalidatePath("/planejamento");
}

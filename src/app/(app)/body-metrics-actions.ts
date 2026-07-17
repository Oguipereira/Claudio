"use server";

import { revalidatePath } from "next/cache";
import { logBodyMetricSchema } from "@/domain/body-metrics/schemas";
import { upsertBodyMetricLog } from "@/server/body-metrics/body-metrics";

export type ActionState = { error?: string };

export async function logBodyMetricAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = logBodyMetricSchema.safeParse({
    date: formData.get("date"),
    weightKg: formData.get("weightKg") || undefined,
    restingHeartRate: formData.get("restingHeartRate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await upsertBodyMetricLog(parsed.data);
  revalidatePath("/");
  revalidatePath("/estatisticas");
  return {};
}

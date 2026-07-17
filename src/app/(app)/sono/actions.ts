"use server";

import { revalidatePath } from "next/cache";
import { logSleepSchema } from "@/domain/sleep/schemas";
import { deleteSleepLog, upsertSleepLog } from "@/server/sleep/sleep-logs";

export type ActionState = { error?: string };

export async function logSleepAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = logSleepSchema.safeParse({
    date: formData.get("date"),
    sleepTime: formData.get("sleepTime"),
    wakeTime: formData.get("wakeTime"),
    quality: formData.get("quality"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Dados invalidos para o registro de sono." };
  }

  await upsertSleepLog(parsed.data);
  revalidatePath("/sono");
  return {};
}

export async function deleteSleepLogAction(id: string) {
  await deleteSleepLog(id);
  revalidatePath("/sono");
}

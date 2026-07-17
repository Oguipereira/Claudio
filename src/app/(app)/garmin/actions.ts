"use server";

import { revalidatePath } from "next/cache";
import { parseGarminActivitiesCsv } from "@/domain/garmin/csv-parser";
import { importGarminActivities, type ImportSummary } from "@/server/garmin/import";

export type ImportState = { error?: string; summary?: ImportSummary };

export async function importGarminCsvAction(
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo CSV." };
  }

  const text = await file.text();
  const activities = parseGarminActivitiesCsv(text);

  if (activities.length === 0) {
    return { error: "Nenhuma atividade encontrada nesse arquivo." };
  }

  const summary = await importGarminActivities(activities);
  revalidatePath("/garmin");
  revalidatePath("/estatisticas");
  return { summary };
}

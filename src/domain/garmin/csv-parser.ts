import Papa from "papaparse";
import { fromZonedTime } from "date-fns-tz";
import { parsePaceToSeconds } from "@/domain/workouts/pace";
import { APP_TIMEZONE } from "@/domain/date";

export type ParsedGarminActivity = {
  externalId: string;
  date: Date;
  activityType: string;
  title: string | null;
  durationMinutes: number | null;
  distanceKm: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  paceSecPerKm: number | null;
  calories: number | null;
  steps: number | null;
  cadence: number | null;
  rawData: Record<string, string>;
};

/// Converte numeros do export do Garmin, que usa virgula como separador de
/// milhar (ex: "5,312" passos) e "--" para valores ausentes.
function parseGarminNumber(value: string | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "--") return null;
  const cleaned = trimmed.replace(/,/g, "");
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

/// Converte duracoes no formato HH:MM:SS(.f) ou MM:SS para minutos inteiros.
function parseGarminDuration(value: string | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "--") return null;

  const parts = trimmed.split(":").map(Number);
  if (parts.some((p) => Number.isNaN(p))) return null;

  let seconds: number;
  if (parts.length === 3) {
    const [h, m, s] = parts;
    seconds = h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const [m, s] = parts;
    seconds = m * 60 + s;
  } else {
    return null;
  }

  return Math.round(seconds / 60);
}

/// A coluna "Velocidade media/maxima" do export em portugues do Garmin
/// Connect mostra ritmo (mm:ss/km) para corrida, nao velocidade em km/h.
/// Para outras modalidades (ex: bike indoor) o valor vem como "--".
function parseGarminPace(value: string | undefined): number | null {
  if (!value) return null;
  return parsePaceToSeconds(value.trim());
}

/// Mapeia o tipo de atividade em texto livre do Garmin para uma categoria do
/// app. Corrida (ar livre ou esteira) mapeia para RUNNING, que e a unica
/// categoria com campos de ritmo/distancia fazendo sentido; qualquer outra
/// atividade (cardio indoor, bike, etc.) cai em STRENGTH como categoria
/// generica de "sessao de academia", ja que o app nao tem uma categoria de
/// cardio dedicada. HYROX nunca e inferido automaticamente -- so é atribuído
/// quando o proprio usuario planeja um treino HYROX.
export function inferWorkoutCategory(activityType: string): "STRENGTH" | "RUNNING" {
  return activityType.toLowerCase().includes("corrida") ? "RUNNING" : "STRENGTH";
}

export function parseGarminActivitiesCsv(csvText: string): ParsedGarminActivity[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row): ParsedGarminActivity | null => {
      const dateStr = row["Data"];
      const activityType = row["Tipo de atividade"];
      if (!dateStr || !activityType) return null;

      // O Garmin Connect exporta o horario no fuso local do usuario (Brasil),
      // nao em UTC -- interpretamos explicitamente nesse fuso para nao
      // depender do fuso do processo que roda o import (Vercel usa UTC).
      const date = fromZonedTime(dateStr.replace(" ", "T"), APP_TIMEZONE);
      if (Number.isNaN(date.getTime())) return null;

      return {
        externalId: `${activityType}:${dateStr}`,
        date,
        activityType,
        title: row["Título"]?.trim() || null,
        durationMinutes: parseGarminDuration(row["Tempo total"]),
        distanceKm: parseGarminNumber(row["Distância"]),
        avgHeartRate: parseGarminNumber(row["FC Média"]),
        maxHeartRate: parseGarminNumber(row["FC máxima"]),
        paceSecPerKm: parseGarminPace(row["Velocidade média"]),
        calories: parseGarminNumber(row["Calorias"]),
        steps: parseGarminNumber(row["Passos"]),
        cadence: parseGarminNumber(row["Cadência bicicleta média"]),
        rawData: row,
      };
    })
    .filter((a): a is ParsedGarminActivity => a !== null);
}

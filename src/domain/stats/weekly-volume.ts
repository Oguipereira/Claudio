import { subWeeks } from "date-fns";
import { toDateKey } from "@/domain/date";
import { getWeekStart } from "@/domain/workouts/week";

export type WorkoutCategory = "STRENGTH" | "HYROX" | "RUNNING";

export type WeeklyVolumeBucket = {
  weekStart: string;
  STRENGTH: number;
  HYROX: number;
  RUNNING: number;
};

/// Gera as datas (segunda-feira) das ultimas `n` semanas, incluindo a atual,
/// em ordem cronologica (mais antiga primeiro).
export function lastNWeekStarts(n: number, reference = new Date()): Date[] {
  const currentWeekStart = getWeekStart(reference);
  return Array.from({ length: n }, (_, i) => subWeeks(currentWeekStart, n - 1 - i));
}

/// Agrupa treinos concluidos por semana e categoria, somando horas.
export function bucketWeeklyVolume(
  logs: { completedAt: Date; category: WorkoutCategory; durationMinutes: number | null }[],
  weekStarts: Date[],
): WeeklyVolumeBucket[] {
  const buckets = new Map<string, WeeklyVolumeBucket>();
  for (const ws of weekStarts) {
    const key = toDateKey(ws);
    buckets.set(key, { weekStart: key, STRENGTH: 0, HYROX: 0, RUNNING: 0 });
  }

  for (const log of logs) {
    const weekKey = toDateKey(getWeekStart(log.completedAt));
    const bucket = buckets.get(weekKey);
    if (!bucket) continue;
    bucket[log.category] += Math.round(((log.durationMinutes ?? 0) / 60) * 100) / 100;
  }

  return Array.from(buckets.values());
}

export { currentStreak } from "@/domain/streak";

export function averageHours(logs: { totalHours: number }[]): number | null {
  if (logs.length === 0) return null;
  const sum = logs.reduce((acc, log) => acc + log.totalHours, 0);
  return Math.round((sum / logs.length) * 10) / 10;
}

export function averageQuality(logs: { quality: number }[]): number | null {
  if (logs.length === 0) return null;
  const sum = logs.reduce((acc, log) => acc + log.quality, 0);
  return Math.round((sum / logs.length) * 10) / 10;
}

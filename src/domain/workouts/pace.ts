/// Ritmo de corrida e sempre digitado/exibido como "mm:ss" (min por km),
/// formato que aparece nos relogios Garmin, e convertido para segundos
/// inteiros para armazenamento (WorkoutLog.paceSecPerKm).

export function parsePaceToSeconds(input: string): number | null {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(input.trim());
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes * 60 + seconds;
}

export function formatSecondsToPace(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

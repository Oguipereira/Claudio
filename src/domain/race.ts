import { differenceInCalendarDays, differenceInCalendarWeeks } from "date-fns";

/// Data provisoria da prova (meados de novembro) -- ajustar para a data real
/// assim que confirmada.
export const RACE_DATE = new Date("2026-11-15");

export type PeriodizationPhase = "base" | "build" | "peak" | "taper" | "race" | "post";

export const PHASE_LABEL: Record<PeriodizationPhase, string> = {
  base: "Base",
  build: "Construção",
  peak: "Pico",
  taper: "Polimento",
  race: "Semana da prova",
  post: "Pós-prova",
};

/// Classificacao simplificada de periodizacao em blocos (Bompa/Matveyev):
/// base (volume) -> construcao (intensidade crescente) -> pico -> polimento
/// (reducao de volume mantendo intensidade, para dissipar fadiga preservando
/// a forma fisica -- Mujika & Padilla, 2003) -> semana da prova.
export function getPeriodizationPhase(
  today: Date,
  raceDate: Date = RACE_DATE,
): PeriodizationPhase {
  const weeksUntil = differenceInCalendarWeeks(raceDate, today);
  if (weeksUntil < 0) return "post";
  if (weeksUntil === 0) return "race";
  if (weeksUntil <= 2) return "taper";
  if (weeksUntil <= 8) return "peak";
  if (weeksUntil <= 16) return "build";
  return "base";
}

export function daysUntilRace(today: Date, raceDate: Date = RACE_DATE): number {
  return differenceInCalendarDays(raceDate, today);
}

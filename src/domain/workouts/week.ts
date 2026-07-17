import { addDays, endOfWeek, startOfWeek } from "date-fns";

export {
  fromPrismaDate,
  parseDateKey,
  toDateKey,
  toPrismaDate,
} from "@/domain/date";

/// Semana de treino comeca na segunda-feira (convencao usada por
/// Strava/TrainingPeaks/Whoop para volume semanal de treino).
export const WEEK_STARTS_ON = 1 as const;

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

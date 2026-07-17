import { subDays } from "date-fns";
import { parseDateKey, toDateKey } from "@/domain/date";

/// Conta dias consecutivos presentes em `loggedDateKeys`, ancorando em hoje ou
/// ontem (o dia mais recente "completo" costuma ser ontem, dependendo de
/// quando o evento e registrado). Se nem hoje nem ontem estiverem presentes,
/// a sequencia esta quebrada (retorna 0).
export function currentStreak(loggedDateKeys: string[], todayKey: string): number {
  const set = new Set(loggedDateKeys);
  const today = parseDateKey(todayKey);

  let anchor: Date;
  if (set.has(toDateKey(today))) {
    anchor = today;
  } else if (set.has(toDateKey(subDays(today, 1)))) {
    anchor = subDays(today, 1);
  } else {
    return 0;
  }

  let streak = 0;
  let cursor = anchor;
  while (set.has(toDateKey(cursor))) {
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

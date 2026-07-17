import { subDays } from "date-fns";
import { parseDateKey, toDateKey } from "@/domain/date";

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

/// Conta noites consecutivas registradas, ancorando em hoje ou ontem (a
/// ultima noite "completa" normalmente e registrada com a data de ontem,
/// ja que o registro so faz sentido depois de acordar). Se nem hoje nem
/// ontem tiverem registro, a sequencia esta quebrada (retorna 0).
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

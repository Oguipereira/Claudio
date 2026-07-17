import { average } from "@/domain/insights/trend";

export type SessionWithPriorSleep = {
  dateKey: string;
  paceSecPerKm: number | null;
  avgHeartRate: number | null;
  priorNightHours: number | null;
};

export type SleepPerformanceComparison = {
  aboveThreshold: { count: number; avgPaceSecPerKm: number | null; avgHeartRate: number | null };
  belowThreshold: { count: number; avgPaceSecPerKm: number | null; avgHeartRate: number | null };
};

/// Compara ritmo/FC de corridas feitas apos noites com mais ou menos horas
/// de sono que `thresholdHours`. Descritivo, nao um teste estatistico
/// formal -- o volume de dados de um unico atleta e pequeno demais para
/// inferencia robusta, mas a direcao do efeito e consistente com a
/// literatura de sono e desempenho de resistencia (Fullagar et al., 2015).
export function compareSleepAndRunningPerformance(
  sessions: SessionWithPriorSleep[],
  thresholdHours = 7,
): SleepPerformanceComparison {
  const withSleep = sessions.filter((s) => s.priorNightHours !== null);
  const above = withSleep.filter((s) => (s.priorNightHours ?? 0) >= thresholdHours);
  const below = withSleep.filter((s) => (s.priorNightHours ?? 0) < thresholdHours);

  const pacesOf = (arr: SessionWithPriorSleep[]) =>
    arr.map((s) => s.paceSecPerKm).filter((v): v is number => v !== null);
  const hrsOf = (arr: SessionWithPriorSleep[]) =>
    arr.map((s) => s.avgHeartRate).filter((v): v is number => v !== null);

  return {
    aboveThreshold: {
      count: above.length,
      avgPaceSecPerKm: average(pacesOf(above)),
      avgHeartRate: average(hrsOf(above)),
    },
    belowThreshold: {
      count: below.length,
      avgPaceSecPerKm: average(pacesOf(below)),
      avgHeartRate: average(hrsOf(below)),
    },
  };
}

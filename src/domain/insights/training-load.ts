import { subDays } from "date-fns";
import { toDateKey } from "@/domain/date";

/// Carga de treino "externa" (Gabbett, 2016): duracao da sessao em minutos.
/// Optamos por essa metrica em vez do TRIMP de Banister (1991), que exige
/// FC de repouso e FC maxima individualizadas que o app nao coleta de forma
/// confiavel -- Gabbett trata carga externa (duracao/distancia) como
/// alternativa valida a carga interna (FC/RPE) para o calculo do ACWR.
export function computeDailyLoad(
  sessions: { date: Date; durationMinutes: number | null }[],
): Map<string, number> {
  const loads = new Map<string, number>();
  for (const session of sessions) {
    const key = toDateKey(session.date);
    loads.set(key, (loads.get(key) ?? 0) + (session.durationMinutes ?? 0));
  }
  return loads;
}

/// Retorna a carga de cada um dos ultimos `days` dias (0 quando nao houve
/// treino), do mais antigo para o mais recente.
export function dailyLoadSeries(
  dailyLoads: Map<string, number>,
  days: number,
  today: Date,
): number[] {
  return Array.from({ length: days }, (_, i) => {
    const day = subDays(today, days - 1 - i);
    return dailyLoads.get(toDateKey(day)) ?? 0;
  });
}

export type AcwrResult = {
  acuteLoad: number;
  chronicLoad: number;
  ratio: number | null;
};

/// ACWR = carga aguda (soma dos ultimos 7 dias) / carga cronica (media
/// semanal dos ultimos 28 dias). Gabbett (2016): a "zona doce" fica entre
/// 0.8 e 1.3; acima de 1.5 o risco de lesao aumenta significativamente;
/// abaixo de 0.8 indica destreino.
export function computeAcwr(dailyLoads: Map<string, number>, today: Date): AcwrResult {
  const last7 = dailyLoadSeries(dailyLoads, 7, today);
  const last28 = dailyLoadSeries(dailyLoads, 28, today);

  const acuteLoad = last7.reduce((a, b) => a + b, 0);
  const chronicWeeklyAvg = last28.reduce((a, b) => a + b, 0) / 4;

  return {
    acuteLoad: Math.round(acuteLoad * 10) / 10,
    chronicLoad: Math.round(chronicWeeklyAvg * 10) / 10,
    ratio: chronicWeeklyAvg > 0 ? Math.round((acuteLoad / chronicWeeklyAvg) * 100) / 100 : null,
  };
}

export type AcwrZone = "detraining" | "optimal" | "caution" | "high-risk";

export function classifyAcwr(ratio: number): AcwrZone {
  if (ratio < 0.8) return "detraining";
  if (ratio <= 1.3) return "optimal";
  if (ratio <= 1.5) return "caution";
  return "high-risk";
}

/// Monotonia de Foster et al. (2001): media / desvio-padrao da carga diaria
/// na semana. Falta de variacao (monotonia alta, >= 2.0) esta associada a
/// maior incidencia de doenca/overtraining mesmo com carga total moderada.
export function computeMonotony(dailyLoads: number[]): number | null {
  if (dailyLoads.length === 0) return null;
  const mean = dailyLoads.reduce((a, b) => a + b, 0) / dailyLoads.length;
  if (mean === 0) return null;

  const variance =
    dailyLoads.reduce((sum, v) => sum + (v - mean) ** 2, 0) / dailyLoads.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return null;

  return Math.round((mean / sd) * 100) / 100;
}

/// Strain de Foster et al. (2001): carga semanal total x monotonia. Picos de
/// strain (nao so a carga isolada) sao o que mais se associa a lesao/doenca
/// em series temporais de atletas.
export function computeStrain(dailyLoads: number[]): number | null {
  const monotony = computeMonotony(dailyLoads);
  if (monotony === null) return null;
  const weeklyLoad = dailyLoads.reduce((a, b) => a + b, 0);
  return Math.round(weeklyLoad * monotony * 10) / 10;
}

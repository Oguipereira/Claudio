import type { AcwrResult } from "@/domain/insights/training-load";
import { classifyAcwr } from "@/domain/insights/training-load";
import { energyAvailability, proteinAdequacy } from "@/domain/insights/nutrition-adequacy";
import type { SleepPerformanceComparison } from "@/domain/insights/sleep-performance";
import { absoluteDelta } from "@/domain/insights/trend";
import type { Insight } from "@/domain/insights/types";

export type InsightInput = {
  acwr: AcwrResult;
  monotony: number | null;
  pace: { thisWeek: number | null; last4Weeks: number | null };
  heartRate: { thisWeek: number | null; last4Weeks: number | null };
  sleep: { thisWeek: number | null; last4Weeks: number | null };
  sleepPerformance: SleepPerformanceComparison | null;
  nutrition: {
    avgProteinG: number | null;
    avgCaloriesIntake: number | null;
    avgTrainingCalories: number | null;
    weightKg: number | null;
  };
  streak: number;
};

const PACE_NOISE_THRESHOLD_SEC = 3;
const HR_NOISE_THRESHOLD_BPM = 2;

export function generateInsights(input: InsightInput): Insight[] {
  const insights: Insight[] = [];

  // --- Carga de treino (ACWR + monotonia) ---
  if (input.acwr.ratio !== null) {
    const zone = classifyAcwr(input.acwr.ratio);
    if (zone === "high-risk") {
      insights.push({
        id: "acwr-high-risk",
        category: "carga",
        severity: "critical",
        message: `Sua relação carga aguda:crônica está em ${input.acwr.ratio.toFixed(2)}, acima de 1.5 — zona de maior risco de lesão (Gabbett, 2016). Considere reduzir o volume dos próximos dias.`,
      });
    } else if (zone === "caution") {
      insights.push({
        id: "acwr-caution",
        category: "carga",
        severity: "warning",
        message: `Relação carga aguda:crônica em ${input.acwr.ratio.toFixed(2)}, um pouco acima da faixa recomendada (0.8–1.3). Vale ficar atento a sinais de fadiga.`,
      });
    } else if (zone === "detraining") {
      insights.push({
        id: "acwr-detraining",
        category: "carga",
        severity: "warning",
        message: `Relação carga aguda:crônica em ${input.acwr.ratio.toFixed(2)}, abaixo de 0.8 — indício de destreino. Se não foi intencional, retome o volume gradualmente.`,
      });
    } else {
      insights.push({
        id: "acwr-optimal",
        category: "carga",
        severity: "positive",
        message: `Relação carga aguda:crônica em ${input.acwr.ratio.toFixed(2)}, dentro da faixa recomendada (0.8–1.3) — bom equilíbrio entre o volume recente e o acumulado.`,
      });
    }
  }

  if (input.monotony !== null && input.monotony >= 2) {
    insights.push({
      id: "monotony-high",
      category: "carga",
      severity: "warning",
      message: `Monotonia de treino alta (${input.monotony.toFixed(1)}) — pouca variação na carga diária dos últimos 7 dias. Isso está associado a maior risco de fadiga e doença (Foster et al., 2001); vale alternar dias mais leves com dias mais intensos.`,
    });
  }

  // --- Desempenho (pace e FC de corrida) ---
  let paceDelta: number | null = null;
  if (input.pace.thisWeek !== null && input.pace.last4Weeks !== null) {
    paceDelta = absoluteDelta(input.pace.thisWeek, input.pace.last4Weeks, 0);
    if (Math.abs(paceDelta) >= PACE_NOISE_THRESHOLD_SEC) {
      const improved = paceDelta < 0;
      insights.push({
        id: "pace-trend",
        category: "desempenho",
        severity: improved ? "positive" : "neutral",
        message: improved
          ? `Seu ritmo médio de corrida melhorou ${Math.abs(paceDelta)}s/km em relação à média das últimas 4 semanas.`
          : `Seu ritmo médio de corrida está ${Math.abs(paceDelta)}s/km mais lento que a média das últimas 4 semanas.`,
      });
    }
  }

  // FC mais baixa com o mesmo pace (ou melhor) e um classico sinal de
  // melhora na eficiencia aerobica -- so faz sentido comparar quando o pace
  // nao piorou de forma relevante.
  const paceNotWorse = paceDelta === null || paceDelta <= PACE_NOISE_THRESHOLD_SEC;
  if (paceNotWorse && input.heartRate.thisWeek !== null && input.heartRate.last4Weeks !== null) {
    const hrDelta = absoluteDelta(input.heartRate.thisWeek, input.heartRate.last4Weeks, 0);
    if (hrDelta <= -HR_NOISE_THRESHOLD_BPM) {
      insights.push({
        id: "hr-efficiency",
        category: "desempenho",
        severity: "positive",
        message: `Sua frequência cardíaca média em corridas caiu ${Math.abs(hrDelta)} bpm mantendo o mesmo ritmo (ou melhor) — sinal de melhora na eficiência aeróbica.`,
      });
    }
  }

  // --- Sono ---
  if (input.sleep.thisWeek !== null && input.sleep.last4Weeks !== null) {
    const delta = absoluteDelta(input.sleep.thisWeek, input.sleep.last4Weeks, 1);
    if (Math.abs(delta) >= 0.3) {
      insights.push({
        id: "sleep-trend",
        category: "sono",
        severity: delta > 0 ? "positive" : "neutral",
        message: `Nos últimos 7 dias sua média de sono foi ${input.sleep.thisWeek.toFixed(1)}h, ${delta > 0 ? `${delta.toFixed(1)}h acima` : `${Math.abs(delta).toFixed(1)}h abaixo`} da média das últimas 4 semanas.`,
      });
    }
  }

  if (input.sleepPerformance) {
    const { aboveThreshold, belowThreshold } = input.sleepPerformance;
    if (
      aboveThreshold.count >= 2 &&
      belowThreshold.count >= 2 &&
      aboveThreshold.avgPaceSecPerKm !== null &&
      belowThreshold.avgPaceSecPerKm !== null
    ) {
      const delta = absoluteDelta(aboveThreshold.avgPaceSecPerKm, belowThreshold.avgPaceSecPerKm, 0);
      if (delta < -PACE_NOISE_THRESHOLD_SEC) {
        insights.push({
          id: "sleep-performance",
          category: "sono",
          severity: "neutral",
          message: `Nas corridas após noites com 7h ou mais de sono, seu ritmo médio foi ${Math.abs(delta)}s/km mais rápido do que após noites mais curtas — consistente com a relação entre sono e desempenho de resistência descrita por Fullagar et al. (2015).`,
        });
      }
    }
  }

  // --- Nutricao ---
  if (input.nutrition.avgProteinG !== null && input.nutrition.weightKg !== null) {
    const adequacy = proteinAdequacy(input.nutrition.avgProteinG, input.nutrition.weightKg);
    if (adequacy.status === "low") {
      insights.push({
        id: "protein-low",
        category: "nutricao",
        severity: "warning",
        message: `Sua ingestão média de proteína (${input.nutrition.avgProteinG.toFixed(0)}g/dia) está abaixo da faixa recomendada para treino combinado de força e resistência (${adequacy.targetMinG.toFixed(0)}–${adequacy.targetMaxG.toFixed(0)}g/dia, ~1.6–2.2g/kg — Jäger et al., 2017).`,
      });
    }
  }

  if (
    input.nutrition.avgCaloriesIntake !== null &&
    input.nutrition.avgTrainingCalories !== null &&
    input.nutrition.weightKg !== null
  ) {
    const availability = energyAvailability(
      input.nutrition.avgCaloriesIntake,
      input.nutrition.avgTrainingCalories,
      input.nutrition.weightKg,
    );
    if (availability < 30) {
      insights.push({
        id: "energy-availability-low",
        category: "nutricao",
        severity: "warning",
        message: `As calorias consumidas parecem baixas frente ao volume de treino (~${availability.toFixed(0)} kcal/kg disponíveis). Disponibilidade energética cronicamente baixa é associada a risco de RED-S (Loucks & Thuma, 2003).`,
      });
    }
  }

  // --- Consistencia ---
  if (input.streak >= 5) {
    insights.push({
      id: "streak-positive",
      category: "desempenho",
      severity: "positive",
      message: `Sequência de ${input.streak} dias treinando — excelente consistência.`,
    });
  }

  return insights;
}

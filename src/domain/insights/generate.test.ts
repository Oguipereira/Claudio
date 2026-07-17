import { describe, expect, it } from "vitest";
import { generateInsights, type InsightInput } from "./generate";

const BASE_INPUT: InsightInput = {
  acwr: { acuteLoad: 0, chronicLoad: 0, ratio: null },
  monotony: null,
  pace: { thisWeek: null, last4Weeks: null },
  heartRate: { thisWeek: null, last4Weeks: null },
  sleep: { thisWeek: null, last4Weeks: null },
  sleepPerformance: null,
  nutrition: {
    avgProteinG: null,
    avgCaloriesIntake: null,
    avgTrainingCalories: null,
    weightKg: null,
  },
  streak: 0,
};

describe("generateInsights", () => {
  it("nao gera nada quando nao ha dados suficientes", () => {
    expect(generateInsights(BASE_INPUT)).toEqual([]);
  });

  it("alerta ACWR em zona de alto risco", () => {
    const insights = generateInsights({
      ...BASE_INPUT,
      acwr: { acuteLoad: 500, chronicLoad: 200, ratio: 2.5 },
    });
    expect(insights.some((i) => i.id === "acwr-high-risk" && i.severity === "critical")).toBe(true);
  });

  it("reconhece ACWR na zona otima", () => {
    const insights = generateInsights({
      ...BASE_INPUT,
      acwr: { acuteLoad: 300, chronicLoad: 280, ratio: 1.07 },
    });
    expect(insights.some((i) => i.id === "acwr-optimal" && i.severity === "positive")).toBe(true);
  });

  it("alerta monotonia alta", () => {
    const insights = generateInsights({ ...BASE_INPUT, monotony: 2.5 });
    expect(insights.some((i) => i.id === "monotony-high")).toBe(true);
  });

  it("celebra melhora de pace", () => {
    const insights = generateInsights({
      ...BASE_INPUT,
      pace: { thisWeek: 288, last4Weeks: 300 },
    });
    const insight = insights.find((i) => i.id === "pace-trend");
    expect(insight?.severity).toBe("positive");
    expect(insight?.message).toContain("melhorou 12s/km");
  });

  it("detecta melhora de eficiencia aerobica (FC menor, pace igual)", () => {
    const insights = generateInsights({
      ...BASE_INPUT,
      pace: { thisWeek: 300, last4Weeks: 301 },
      heartRate: { thisWeek: 145, last4Weeks: 152 },
    });
    expect(insights.some((i) => i.id === "hr-efficiency")).toBe(true);
  });

  it("nao gera insight de FC quando o pace piorou bastante", () => {
    const insights = generateInsights({
      ...BASE_INPUT,
      pace: { thisWeek: 320, last4Weeks: 300 },
      heartRate: { thisWeek: 145, last4Weeks: 152 },
    });
    expect(insights.some((i) => i.id === "hr-efficiency")).toBe(false);
  });

  it("alerta proteina abaixo da faixa recomendada", () => {
    const insights = generateInsights({
      ...BASE_INPUT,
      nutrition: { avgProteinG: 90, avgCaloriesIntake: null, avgTrainingCalories: null, weightKg: 80 },
    });
    expect(insights.some((i) => i.id === "protein-low")).toBe(true);
  });

  it("nao alerta proteina quando adequada", () => {
    const insights = generateInsights({
      ...BASE_INPUT,
      nutrition: { avgProteinG: 150, avgCaloriesIntake: null, avgTrainingCalories: null, weightKg: 80 },
    });
    expect(insights.some((i) => i.id === "protein-low")).toBe(false);
  });

  it("celebra sequencia de dias treinando", () => {
    const insights = generateInsights({ ...BASE_INPUT, streak: 7 });
    expect(insights.some((i) => i.id === "streak-positive")).toBe(true);
  });

  it("nao celebra sequencia curta", () => {
    const insights = generateInsights({ ...BASE_INPUT, streak: 2 });
    expect(insights.some((i) => i.id === "streak-positive")).toBe(false);
  });
});

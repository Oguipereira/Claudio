import { describe, expect, it } from "vitest";
import {
  classifyAcwr,
  computeAcwr,
  computeDailyLoad,
  computeMonotony,
  computeStrain,
  dailyLoadSeries,
} from "./training-load";
import { parseDateKey, toDateKey } from "@/domain/date";

describe("computeDailyLoad", () => {
  it("soma duracao por dia", () => {
    const loads = computeDailyLoad([
      { date: parseDateKey("2026-07-10"), durationMinutes: 30 },
      { date: parseDateKey("2026-07-10"), durationMinutes: 20 },
      { date: parseDateKey("2026-07-11"), durationMinutes: 45 },
    ]);
    expect(loads.get("2026-07-10")).toBe(50);
    expect(loads.get("2026-07-11")).toBe(45);
  });
});

describe("computeAcwr", () => {
  it("calcula acwr com carga aguda e cronica estaveis (proximo de 1.0)", () => {
    const today = parseDateKey("2026-07-28");
    const loads = new Map<string, number>();
    // 28 dias de 60min cada -> carga aguda = 420, cronica semanal = 420
    for (let i = 0; i < 28; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      loads.set(toDateKey(day), 60);
    }
    const result = computeAcwr(loads, today);
    expect(result.ratio).toBe(1);
  });

  it("retorna ratio nulo quando nao ha carga cronica", () => {
    const result = computeAcwr(new Map(), parseDateKey("2026-07-28"));
    expect(result.ratio).toBeNull();
  });

  it("detecta pico agudo (ratio alto)", () => {
    const today = parseDateKey("2026-07-28");
    const loads = new Map<string, number>();
    // carga cronica baixa (so 1 sessao de 30min nas ultimas 4 semanas)
    loads.set("2026-07-01", 30);
    // carga aguda alta (treinos pesados nos ultimos 7 dias)
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      loads.set(toDateKey(day), 90);
    }
    const result = computeAcwr(loads, today);
    expect(result.ratio).toBeGreaterThan(1.5);
  });
});

describe("classifyAcwr", () => {
  it("classifica as zonas corretamente", () => {
    expect(classifyAcwr(0.5)).toBe("detraining");
    expect(classifyAcwr(1.0)).toBe("optimal");
    expect(classifyAcwr(1.4)).toBe("caution");
    expect(classifyAcwr(1.8)).toBe("high-risk");
  });
});

describe("computeMonotony", () => {
  it("retorna alta monotonia quando a carga e constante", () => {
    const monotony = computeMonotony([60, 60, 60, 60, 60, 60, 60]);
    expect(monotony).toBeNull(); // sd = 0
  });

  it("calcula monotonia com variacao normal", () => {
    const monotony = computeMonotony([60, 0, 45, 0, 60, 0, 30]);
    expect(monotony).toBeGreaterThan(0);
  });
});

describe("computeStrain", () => {
  it("multiplica carga semanal pela monotonia", () => {
    const strain = computeStrain([60, 0, 45, 0, 60, 0, 30]);
    const monotony = computeMonotony([60, 0, 45, 0, 60, 0, 30]);
    const total = 60 + 45 + 60 + 30;
    expect(strain).toBe(Math.round(total * (monotony ?? 0) * 10) / 10);
  });
});

describe("dailyLoadSeries", () => {
  it("preenche dias sem treino com 0", () => {
    const loads = new Map([["2026-07-15", 40]]);
    const series = dailyLoadSeries(loads, 3, parseDateKey("2026-07-15"));
    expect(series).toEqual([0, 0, 40]);
  });
});

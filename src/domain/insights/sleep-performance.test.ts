import { describe, expect, it } from "vitest";
import { compareSleepAndRunningPerformance } from "./sleep-performance";

describe("compareSleepAndRunningPerformance", () => {
  it("separa sessoes por limiar de horas de sono", () => {
    const result = compareSleepAndRunningPerformance([
      { dateKey: "2026-07-01", paceSecPerKm: 300, avgHeartRate: 150, priorNightHours: 8 },
      { dateKey: "2026-07-03", paceSecPerKm: 320, avgHeartRate: 160, priorNightHours: 5 },
      { dateKey: "2026-07-05", paceSecPerKm: 290, avgHeartRate: 145, priorNightHours: 7.5 },
    ]);
    expect(result.aboveThreshold.count).toBe(2);
    expect(result.aboveThreshold.avgPaceSecPerKm).toBe(295);
    expect(result.belowThreshold.count).toBe(1);
    expect(result.belowThreshold.avgPaceSecPerKm).toBe(320);
  });

  it("ignora sessoes sem dado de sono correspondente", () => {
    const result = compareSleepAndRunningPerformance([
      { dateKey: "2026-07-01", paceSecPerKm: 300, avgHeartRate: 150, priorNightHours: null },
    ]);
    expect(result.aboveThreshold.count).toBe(0);
    expect(result.belowThreshold.count).toBe(0);
  });
});

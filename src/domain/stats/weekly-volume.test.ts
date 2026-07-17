import { describe, expect, it } from "vitest";
import { bucketWeeklyVolume, lastNWeekStarts } from "./weekly-volume";
import { parseDateKey, toDateKey } from "@/domain/date";

describe("lastNWeekStarts", () => {
  it("gera N semanas terminando na semana atual, em ordem cronologica", () => {
    const weeks = lastNWeekStarts(4, parseDateKey("2026-07-15"));
    expect(weeks).toHaveLength(4);
    expect(toDateKey(weeks[3])).toBe("2026-07-13");
    expect(toDateKey(weeks[0])).toBe("2026-06-22");
  });
});

describe("bucketWeeklyVolume", () => {
  it("soma horas por categoria e semana", () => {
    const weekStarts = lastNWeekStarts(2, parseDateKey("2026-07-15"));
    const logs = [
      { completedAt: new Date("2026-07-14T10:00:00"), category: "RUNNING" as const, durationMinutes: 30 },
      { completedAt: new Date("2026-07-14T18:00:00"), category: "STRENGTH" as const, durationMinutes: 60 },
      { completedAt: new Date("2026-07-06T10:00:00"), category: "HYROX" as const, durationMinutes: 45 },
    ];
    const buckets = bucketWeeklyVolume(logs, weekStarts);
    expect(buckets).toHaveLength(2);
    expect(buckets[1]).toEqual({ weekStart: "2026-07-13", STRENGTH: 1, HYROX: 0, RUNNING: 0.5 });
    expect(buckets[0]).toEqual({ weekStart: "2026-07-06", STRENGTH: 0, HYROX: 0.75, RUNNING: 0 });
  });

  it("ignora logs fora do intervalo de semanas fornecido", () => {
    const weekStarts = lastNWeekStarts(1, parseDateKey("2026-07-15"));
    const logs = [
      { completedAt: new Date("2026-01-01T10:00:00"), category: "RUNNING" as const, durationMinutes: 30 },
    ];
    const buckets = bucketWeeklyVolume(logs, weekStarts);
    expect(buckets[0]).toEqual({ weekStart: "2026-07-13", STRENGTH: 0, HYROX: 0, RUNNING: 0 });
  });
});

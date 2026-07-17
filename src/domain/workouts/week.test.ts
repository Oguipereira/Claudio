import { describe, expect, it } from "vitest";
import { getWeekDays, getWeekStart, parseDateKey, toDateKey } from "./week";

describe("getWeekStart", () => {
  it("retorna a segunda-feira da semana para uma quarta-feira", () => {
    const wednesday = parseDateKey("2026-07-15");
    expect(toDateKey(getWeekStart(wednesday))).toBe("2026-07-13");
  });

  it("mantem a mesma data quando ja e segunda-feira", () => {
    const monday = parseDateKey("2026-07-13");
    expect(toDateKey(getWeekStart(monday))).toBe("2026-07-13");
  });
});

describe("getWeekDays", () => {
  it("retorna 7 dias comecando na segunda", () => {
    const start = getWeekStart(parseDateKey("2026-07-15"));
    const days = getWeekDays(start);
    expect(days).toHaveLength(7);
    expect(toDateKey(days[0])).toBe("2026-07-13");
    expect(toDateKey(days[6])).toBe("2026-07-19");
  });
});

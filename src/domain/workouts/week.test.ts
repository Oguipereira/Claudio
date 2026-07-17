import { describe, expect, it } from "vitest";
import {
  fromPrismaDate,
  getWeekDays,
  getWeekStart,
  parseDateKey,
  toDateKey,
  toPrismaDate,
} from "./week";

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

describe("toPrismaDate / fromPrismaDate", () => {
  it("faz o roundtrip sem alterar o dia de calendario", () => {
    const local = parseDateKey("2026-07-15");
    const prismaValue = toPrismaDate(local);
    expect(prismaValue.toISOString()).toBe("2026-07-15T00:00:00.000Z");
    const roundtripped = fromPrismaDate(prismaValue);
    expect(toDateKey(roundtripped)).toBe("2026-07-15");
  });
});

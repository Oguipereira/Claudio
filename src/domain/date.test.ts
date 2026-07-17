import { describe, expect, it } from "vitest";
import {
  dateKeyInAppTimezone,
  fromPrismaDate,
  parseDateKey,
  toDateKey,
  toPrismaDate,
} from "./date";

describe("toPrismaDate / fromPrismaDate", () => {
  it("faz o roundtrip sem alterar o dia de calendario", () => {
    const local = parseDateKey("2026-07-15");
    const prismaValue = toPrismaDate(local);
    expect(prismaValue.toISOString()).toBe("2026-07-15T00:00:00.000Z");
    expect(toDateKey(fromPrismaDate(prismaValue))).toBe("2026-07-15");
  });
});

describe("dateKeyInAppTimezone", () => {
  it("agrupa um horario noturno no Brasil no dia correto, mesmo vindo de um instante UTC do dia seguinte", () => {
    // 2026-07-16 23:30 no Brasil (UTC-3) = 2026-07-17 02:30 UTC.
    const lateNightBrazil = new Date("2026-07-17T02:30:00.000Z");
    expect(dateKeyInAppTimezone(lateNightBrazil)).toBe("2026-07-16");
  });

  it("agrupa um horario diurno no dia esperado", () => {
    // 2026-07-16 14:00 no Brasil (UTC-3) = 2026-07-16 17:00 UTC.
    const afternoonBrazil = new Date("2026-07-16T17:00:00.000Z");
    expect(dateKeyInAppTimezone(afternoonBrazil)).toBe("2026-07-16");
  });
});

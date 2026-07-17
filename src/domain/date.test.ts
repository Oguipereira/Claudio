import { describe, expect, it } from "vitest";
import { fromPrismaDate, parseDateKey, toDateKey, toPrismaDate } from "./date";

describe("toPrismaDate / fromPrismaDate", () => {
  it("faz o roundtrip sem alterar o dia de calendario", () => {
    const local = parseDateKey("2026-07-15");
    const prismaValue = toPrismaDate(local);
    expect(prismaValue.toISOString()).toBe("2026-07-15T00:00:00.000Z");
    expect(toDateKey(fromPrismaDate(prismaValue))).toBe("2026-07-15");
  });
});

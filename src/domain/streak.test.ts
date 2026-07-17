import { describe, expect, it } from "vitest";
import { currentStreak } from "./streak";

describe("currentStreak", () => {
  it("conta dias consecutivos ancorando em ontem", () => {
    expect(
      currentStreak(["2026-07-12", "2026-07-13", "2026-07-14"], "2026-07-15"),
    ).toBe(3);
  });

  it("retorna 0 quando a sequencia esta quebrada", () => {
    expect(currentStreak(["2026-07-10", "2026-07-11"], "2026-07-15")).toBe(0);
  });

  it("para na primeira lacuna", () => {
    expect(
      currentStreak(["2026-07-10", "2026-07-13", "2026-07-14"], "2026-07-15"),
    ).toBe(2);
  });

  it("inclui hoje quando ja registrado", () => {
    expect(currentStreak(["2026-07-14", "2026-07-15"], "2026-07-15")).toBe(2);
  });
});

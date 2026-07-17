import { describe, expect, it } from "vitest";
import { averageHours, averageQuality, currentStreak } from "./aggregates";

describe("averageHours", () => {
  it("calcula a media de horas", () => {
    expect(averageHours([{ totalHours: 7 }, { totalHours: 8 }, { totalHours: 9 }])).toBe(8);
  });

  it("retorna null para lista vazia", () => {
    expect(averageHours([])).toBeNull();
  });
});

describe("averageQuality", () => {
  it("calcula a media de qualidade", () => {
    expect(averageQuality([{ quality: 3 }, { quality: 5 }])).toBe(4);
  });
});

describe("currentStreak", () => {
  it("conta dias consecutivos ancorando em ontem", () => {
    const streak = currentStreak(
      ["2026-07-12", "2026-07-13", "2026-07-14"],
      "2026-07-15",
    );
    expect(streak).toBe(3);
  });

  it("retorna 0 quando a sequencia esta quebrada (nem hoje nem ontem)", () => {
    const streak = currentStreak(["2026-07-10", "2026-07-11"], "2026-07-15");
    expect(streak).toBe(0);
  });

  it("para na primeira lacuna", () => {
    const streak = currentStreak(
      ["2026-07-10", "2026-07-13", "2026-07-14"],
      "2026-07-15",
    );
    expect(streak).toBe(2);
  });

  it("inclui hoje quando ja registrado", () => {
    const streak = currentStreak(["2026-07-14", "2026-07-15"], "2026-07-15");
    expect(streak).toBe(2);
  });
});

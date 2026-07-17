import { describe, expect, it } from "vitest";
import { averageHours, averageQuality } from "./aggregates";

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

import { describe, expect, it } from "vitest";
import { absoluteDelta, average, percentDelta } from "./trend";

describe("average", () => {
  it("calcula a media", () => {
    expect(average([1, 2, 3])).toBe(2);
  });
  it("retorna null para lista vazia", () => {
    expect(average([])).toBeNull();
  });
});

describe("percentDelta", () => {
  it("calcula variacao percentual positiva", () => {
    expect(percentDelta(110, 100)).toBe(10);
  });
  it("calcula variacao percentual negativa", () => {
    expect(percentDelta(90, 100)).toBe(-10);
  });
  it("retorna null quando baseline e zero", () => {
    expect(percentDelta(10, 0)).toBeNull();
  });
});

describe("absoluteDelta", () => {
  it("calcula diferenca com arredondamento", () => {
    expect(absoluteDelta(7.83, 7.5)).toBe(0.3);
  });
});

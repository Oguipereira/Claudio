import { describe, expect, it } from "vitest";
import { energyAvailability, proteinAdequacy } from "./nutrition-adequacy";

describe("proteinAdequacy", () => {
  it("classifica como baixo quando abaixo de 1.6g/kg", () => {
    const result = proteinAdequacy(100, 80); // 1.25 g/kg
    expect(result.status).toBe("low");
    expect(result.targetMinG).toBe(128);
    expect(result.targetMaxG).toBe(176);
  });

  it("classifica como adequado dentro da faixa", () => {
    expect(proteinAdequacy(150, 80).status).toBe("adequate");
  });

  it("classifica como alto muito acima da faixa", () => {
    expect(proteinAdequacy(250, 80).status).toBe("high");
  });
});

describe("energyAvailability", () => {
  it("calcula disponibilidade energetica por kg", () => {
    expect(energyAvailability(3000, 500, 80)).toBe(31.3);
  });
});

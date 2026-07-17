import { describe, expect, it } from "vitest";
import { daysUntilRace, getPeriodizationPhase } from "./race";

const RACE = new Date("2026-11-15");

describe("getPeriodizationPhase", () => {
  it("classifica como base quando faltam mais de 16 semanas", () => {
    expect(getPeriodizationPhase(new Date("2026-06-01"), RACE)).toBe("base");
  });

  it("classifica como construcao entre 9 e 16 semanas", () => {
    expect(getPeriodizationPhase(new Date("2026-08-15"), RACE)).toBe("build");
  });

  it("classifica como pico entre 3 e 8 semanas", () => {
    expect(getPeriodizationPhase(new Date("2026-10-01"), RACE)).toBe("peak");
  });

  it("classifica como polimento nas ultimas 2 semanas", () => {
    expect(getPeriodizationPhase(new Date("2026-11-05"), RACE)).toBe("taper");
  });

  it("classifica como semana da prova na semana exata", () => {
    expect(getPeriodizationPhase(new Date("2026-11-15"), RACE)).toBe("race");
  });

  it("classifica como pos-prova depois da data", () => {
    expect(getPeriodizationPhase(new Date("2026-11-20"), RACE)).toBe("post");
  });
});

describe("daysUntilRace", () => {
  it("calcula dias restantes", () => {
    expect(daysUntilRace(new Date("2026-11-10"), RACE)).toBe(5);
  });
});

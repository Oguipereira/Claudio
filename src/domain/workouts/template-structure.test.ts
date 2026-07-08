import { describe, expect, it } from "vitest";
import { templateStructureSchema } from "./template-structure";

describe("templateStructureSchema", () => {
  it("aceita uma estrutura de forca valida", () => {
    const result = templateStructureSchema.safeParse({
      kind: "strength",
      muscleGroups: ["Peito", "Triceps", "Ombro", "Biceps"],
    });
    expect(result.success).toBe(true);
  });

  it("aceita uma estrutura HYROX com blocos e rounds", () => {
    const result = templateStructureSchema.safeParse({
      kind: "hyrox",
      blocks: [
        {
          name: "Bloco 1",
          rounds: 3,
          station: "2 minutos Carrinho",
          exercises: ["10 Burpees", "10 Flexoes", "10 Burpees"],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita uma estrutura HYROX sem blocos", () => {
    const result = templateStructureSchema.safeParse({
      kind: "hyrox",
      blocks: [],
    });
    expect(result.success).toBe(false);
  });

  it("aceita uma estrutura de corrida apenas com distancia alvo", () => {
    const result = templateStructureSchema.safeParse({
      kind: "running",
      targetDistanceKm: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita kind desconhecido", () => {
    const result = templateStructureSchema.safeParse({
      kind: "yoga",
    });
    expect(result.success).toBe(false);
  });
});

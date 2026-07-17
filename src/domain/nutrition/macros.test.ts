import { describe, expect, it } from "vitest";
import { computeMacrosForGrams, sumMacros } from "./macros";

describe("computeMacrosForGrams", () => {
  it("escala os macros proporcionalmente ao peso", () => {
    const arroz = {
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fiberPer100g: 0.4,
    };
    const result = computeMacrosForGrams(arroz, 150);
    expect(result.calories).toBe(195);
    expect(result.protein).toBe(4.1);
    expect(result.carbs).toBe(42);
    expect(result.fat).toBe(0.5);
    expect(result.fiber).toBe(0.6);
  });

  it("trata fibra ausente como null", () => {
    const result = computeMacrosForGrams(
      { caloriesPer100g: 100, proteinPer100g: 10, carbsPer100g: 10, fatPer100g: 1 },
      100,
    );
    expect(result.fiber).toBeNull();
  });
});

describe("sumMacros", () => {
  it("soma varias entradas", () => {
    const total = sumMacros([
      { calories: 100, protein: 10, carbs: 20, fat: 2, fiber: 1 },
      { calories: 200, protein: 20, carbs: 10, fat: 5, fiber: 2 },
    ]);
    expect(total).toEqual({ calories: 300, protein: 30, carbs: 30, fat: 7, fiber: 3 });
  });
});

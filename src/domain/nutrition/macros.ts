export type MacrosPer100g = {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number | null;
};

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
};

/// Calcula os macros efetivos de uma porcao a partir dos valores por 100g e
/// do peso pesado na balanca. Arredonda para 1 casa decimal (precisao
/// suficiente para uma balanca de cozinha domestica).
export function computeMacrosForGrams(
  item: MacrosPer100g,
  grams: number,
): Macros {
  const factor = grams / 100;
  const round1 = (value: number) => Math.round(value * 10) / 10;

  return {
    calories: round1(item.caloriesPer100g * factor),
    protein: round1(item.proteinPer100g * factor),
    carbs: round1(item.carbsPer100g * factor),
    fat: round1(item.fatPer100g * factor),
    fiber:
      item.fiberPer100g !== null && item.fiberPer100g !== undefined
        ? round1(item.fiberPer100g * factor)
        : null,
  };
}

export function sumMacros(entries: Macros[]): Macros {
  return entries.reduce<Macros>(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      fiber: (acc.fiber ?? 0) + (entry.fiber ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

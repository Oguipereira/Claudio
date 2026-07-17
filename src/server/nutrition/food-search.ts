import type { FoodSource } from "@/generated/prisma/client";

export type FoodSearchResult = {
  source: FoodSource;
  externalId: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

type UsdaNutrient = {
  nutrientName: string;
  unitName: string;
  value: number;
};

type UsdaFood = {
  fdcId: number;
  description: string;
  foodNutrients: UsdaNutrient[];
};

function findNutrient(nutrients: UsdaNutrient[], namePart: string) {
  return nutrients.find((n) =>
    n.nutrientName.toLowerCase().includes(namePart.toLowerCase()),
  )?.value;
}

export async function searchUsdaFoods(query: string): Promise<FoodSearchResult[]> {
  const apiKey = process.env.USDA_FDC_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", "10");
  url.searchParams.set("dataType", "Foundation,SR Legacy,Branded");
  url.searchParams.set("api_key", apiKey);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { foods?: UsdaFood[] };

    return (data.foods ?? [])
      .map((food): FoodSearchResult | null => {
        const calories = findNutrient(food.foodNutrients, "energy");
        const protein = findNutrient(food.foodNutrients, "protein");
        const carbs = findNutrient(food.foodNutrients, "carbohydrate");
        const fat = findNutrient(food.foodNutrients, "total lipid");
        const fiber = findNutrient(food.foodNutrients, "fiber");

        if (calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
          return null;
        }

        return {
          source: "USDA" as const,
          externalId: String(food.fdcId),
          name: food.description,
          caloriesPer100g: round1(calories),
          proteinPer100g: round1(protein),
          carbsPer100g: round1(carbs),
          fatPer100g: round1(fat),
          fiberPer100g: fiber !== undefined ? round1(fiber) : undefined,
        };
      })
      .filter((f): f is FoodSearchResult => f !== null);
  } catch (err) {
    console.error("[usda] busca falhou:", err);
    return [];
  }
}

type OffProduct = {
  code: string;
  product_name?: string;
  nutriments?: Record<string, number>;
};

export async function searchOpenFoodFacts(query: string): Promise<FoodSearchResult[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "10");
  url.searchParams.set("fields", "code,product_name,nutriments");

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "HYROX-Performance-OS - single user app" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: OffProduct[] };

    return (data.products ?? [])
      .map((product): FoodSearchResult | null => {
        const n = product.nutriments ?? {};
        const calories = n["energy-kcal_100g"];
        const protein = n["proteins_100g"];
        const carbs = n["carbohydrates_100g"];
        const fat = n["fat_100g"];
        const fiber = n["fiber_100g"];

        if (
          !product.product_name ||
          calories === undefined ||
          protein === undefined ||
          carbs === undefined ||
          fat === undefined
        ) {
          return null;
        }

        return {
          source: "OPEN_FOOD_FACTS" as const,
          externalId: product.code,
          name: product.product_name,
          caloriesPer100g: round1(calories),
          proteinPer100g: round1(protein),
          carbsPer100g: round1(carbs),
          fatPer100g: round1(fat),
          fiberPer100g: fiber !== undefined ? round1(fiber) : undefined,
        };
      })
      .filter((f): f is FoodSearchResult => f !== null);
  } catch (err) {
    console.error("[openfoodfacts] busca falhou:", err);
    return [];
  }
}

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const [usda, off] = await Promise.all([
    searchUsdaFoods(query),
    searchOpenFoodFacts(query),
  ]);
  return [...usda, ...off];
}

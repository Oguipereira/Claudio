import type { Macros } from "@/domain/nutrition/macros";
import type { NutritionGoal } from "@/generated/prisma/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const METRICS = [
  { key: "calories", label: "Calorias", unit: "kcal", goalKey: "caloriesTarget" },
  { key: "protein", label: "Proteína", unit: "g", goalKey: "proteinTarget" },
  { key: "carbs", label: "Carboidratos", unit: "g", goalKey: "carbsTarget" },
  { key: "fat", label: "Gordura", unit: "g", goalKey: "fatTarget" },
] as const;

export function MacroSummary({
  total,
  goal,
}: {
  total: Macros;
  goal: NutritionGoal | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {METRICS.map((metric) => {
        const consumed = total[metric.key];
        const target = goal?.[metric.goalKey];
        const pct = target ? Math.min(100, Math.round((consumed / target) * 100)) : null;

        return (
          <Card key={metric.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-xl font-semibold tabular-nums">
                {Math.round(consumed)}
                {target ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {target} {metric.unit}
                  </span>
                ) : (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    {metric.unit}
                  </span>
                )}
              </p>
              {pct !== null ? <Progress value={pct} /> : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

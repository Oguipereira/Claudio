import type { MealType, Prisma } from "@/generated/prisma/client";
import { AddFoodDialog } from "./add-food-dialog";
import { FoodLogItem } from "./food-log-item";

type FoodLogWithItem = Prisma.FoodLogGetPayload<{ include: { foodItem: true } }>;

export function MealSection({
  meal,
  label,
  date,
  logs,
}: {
  meal: MealType;
  label: string;
  date: string;
  logs: FoodLogWithItem[];
}) {
  const calories = logs.reduce((sum, log) => sum + log.calories, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold">{label}</h2>
          {logs.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {Math.round(calories)} kcal
            </span>
          ) : null}
        </div>
        <AddFoodDialog meal={meal} date={date} />
      </div>

      {logs.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
          Nenhum alimento registrado
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <FoodLogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

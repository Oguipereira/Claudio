import Link from "next/link";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nowInAppTimezone, parseDateKey, toDateKey } from "@/domain/date";
import { sumMacros } from "@/domain/nutrition/macros";
import { MEAL_LABEL, MEAL_ORDER } from "@/domain/nutrition/labels";
import { listFoodLogsForDate } from "@/server/nutrition/food-logs";
import { getCurrentNutritionGoal } from "@/server/nutrition/nutrition-goals";
import { GoalDialog } from "./goal-dialog";
import { MacroSummary } from "./macro-summary";
import { MealSection } from "./meal-section";

export default async function NutricaoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ? parseDateKey(params.date) : nowInAppTimezone();
  const dateKey = toDateKey(date);

  const [logs, goal] = await Promise.all([
    listFoodLogsForDate(date),
    getCurrentNutritionGoal(),
  ]);

  const total = sumMacros(logs);
  const prevDateKey = toDateKey(addDays(date, -1));
  const nextDateKey = toDateKey(addDays(date, 1));
  const todayKey = toDateKey(nowInAppTimezone());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nutrição</h1>
          <p className="text-sm capitalize text-muted-foreground">
            {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            render={<Link href={`/nutricao?date=${prevDateKey}`} aria-label="Dia anterior" />}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" render={<Link href={`/nutricao?date=${todayKey}`} />}>
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            render={<Link href={`/nutricao?date=${nextDateKey}`} aria-label="Proximo dia" />}
          >
            <ChevronRight />
          </Button>
          <GoalDialog goal={goal} />
        </div>
      </div>

      <MacroSummary total={total} goal={goal} />

      <div className="flex flex-col gap-4">
        {MEAL_ORDER.map((meal) => (
          <MealSection
            key={meal}
            meal={meal}
            label={MEAL_LABEL[meal]}
            date={dateKey}
            logs={logs.filter((log) => log.mealType === meal)}
          />
        ))}
      </div>
    </div>
  );
}

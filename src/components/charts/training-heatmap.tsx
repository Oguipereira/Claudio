import { addDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { nowInAppTimezone } from "@/domain/date";
import { getWeekStart } from "@/domain/workouts/week";
import { cn } from "@/lib/utils";

function intensityClass(count: number): string {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-chart-1/35";
  if (count === 2) return "bg-chart-1/70";
  return "bg-chart-1";
}

export function TrainingHeatmap({
  counts,
  weeks = 16,
}: {
  counts: Map<string, number>;
  weeks?: number;
}) {
  const today = nowInAppTimezone();
  const start = getWeekStart(subDays(today, (weeks - 1) * 7));

  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  const columns: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {columns.map((column, i) => (
        <div key={i} className="flex flex-col gap-1">
          {column.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const count = counts.get(key) ?? 0;
            const isFuture = day > today;
            return (
              <div
                key={key}
                title={`${format(day, "d 'de' MMMM", { locale: ptBR })}: ${count} treino${count === 1 ? "" : "s"}`}
                className={cn(
                  "size-3 rounded-[2px]",
                  isFuture ? "bg-transparent" : intensityClass(count),
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

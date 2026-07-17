import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getWeekDays,
  getWeekEnd,
  getWeekStart,
  parseDateKey,
  toDateKey,
} from "@/domain/workouts/week";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { listPlannedWorkoutsInRange } from "@/server/workouts/planned-workouts";
import { listWorkoutTemplates } from "@/server/workouts/templates";
import { WeekView } from "./week-view";

export default async function PlanejamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const reference = params.week ? parseDateKey(params.week) : new Date();
  const weekStart = getWeekStart(reference);
  const weekEnd = getWeekEnd(reference);
  const days = getWeekDays(weekStart);

  const [plannedWorkouts, templates] = await Promise.all([
    listPlannedWorkoutsInRange(weekStart, weekEnd),
    listWorkoutTemplates(),
  ]);

  const prevWeekKey = toDateKey(addDays(weekStart, -7));
  const nextWeekKey = toDateKey(addDays(weekStart, 7));
  const todayWeekKey = toDateKey(getWeekStart(new Date()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Planejamento
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} —{" "}
            {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            render={<Link href={`/planejamento?week=${prevWeekKey}`} aria-label="Semana anterior" />}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" render={<Link href={`/planejamento?week=${todayWeekKey}`} />}>
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            render={<Link href={`/planejamento?week=${nextWeekKey}`} aria-label="Proxima semana" />}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <WeekView days={days} plannedWorkouts={plannedWorkouts} templates={templates} />
    </div>
  );
}

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { listWorkoutLogs } from "@/server/workouts/workout-logs";
import type { WorkoutCategory } from "@/generated/prisma/client";
import { CATEGORY_LABEL } from "@/domain/workouts/labels";
import { fromPrismaDate } from "@/domain/workouts/week";
import { formatSecondsToPace } from "@/domain/workouts/pace";
import { Button } from "@/components/ui/button";
import { WorkoutLogCard } from "./workout-log-card";

const FILTERS: { label: string; value?: WorkoutCategory }[] = [
  { label: "Todos" },
  { label: "Musculação", value: "STRENGTH" },
  { label: "HYROX", value: "HYROX" },
  { label: "Corrida", value: "RUNNING" },
];

export default async function TreinosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const category =
    categoria && categoria in CATEGORY_LABEL
      ? (categoria as WorkoutCategory)
      : undefined;

  const logs = await listWorkoutLogs(category);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Treinos</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de musculação, HYROX e corridas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            variant={category === filter.value ? "default" : "outline"}
            size="sm"
            render={
              <Link
                href={
                  filter.value
                    ? `/treinos?categoria=${filter.value}`
                    : "/treinos"
                }
              />
            }
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {logs.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhum treino registrado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <WorkoutLogCard
              key={log.id}
              log={log}
              dateLabel={format(
                fromPrismaDate(log.plannedWorkout.date),
                "EEEE, d 'de' MMMM",
                { locale: ptBR },
              )}
              paceLabel={
                log.paceSecPerKm
                  ? `${formatSecondsToPace(log.paceSecPerKm)}/km`
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPlannedWorkoutForLogging } from "@/server/workouts/workout-logs";
import { LogWorkoutForm } from "./log-workout-form";

export default async function NovoTreinoPage({
  searchParams,
}: {
  searchParams: Promise<{ plannedWorkoutId?: string }>;
}) {
  const { plannedWorkoutId } = await searchParams;
  const plannedWorkout = plannedWorkoutId
    ? await getPlannedWorkoutForLogging(plannedWorkoutId)
    : null;

  if (!plannedWorkout) {
    return (
      <EmptyState message="Treino nao encontrado. Volte ao planejamento e selecione um treino para concluir." />
    );
  }

  if (plannedWorkout.status === "COMPLETED") {
    return <EmptyState message="Este treino ja foi concluido e registrado." />;
  }

  if (plannedWorkout.status === "CANCELLED") {
    return (
      <EmptyState message="Este treino esta cancelado e nao pode ser registrado." />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Registrar treino
        </h1>
        <p className="text-sm text-muted-foreground">
          {plannedWorkout.template?.name ?? plannedWorkout.adHocLabel}
        </p>
      </div>
      <LogWorkoutForm plannedWorkout={plannedWorkout} />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button render={<Link href="/planejamento" />}>Voltar ao planejamento</Button>
    </div>
  );
}

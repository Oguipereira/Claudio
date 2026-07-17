"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { CATEGORY_ICON } from "@/components/workout-category-icon";
import { deleteWorkoutLogAction } from "./actions";

type WorkoutLogWithRelations = Prisma.WorkoutLogGetPayload<{
  include: { plannedWorkout: { include: { template: true } } };
}>;

export function WorkoutLogCard({
  log,
  dateLabel,
  paceLabel,
}: {
  log: WorkoutLogWithRelations;
  dateLabel: string;
  paceLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const Icon = CATEGORY_ICON[log.category];
  const label =
    log.plannedWorkout.template?.name ??
    log.plannedWorkout.adHocLabel ??
    "Treino";

  const metrics: string[] = [];
  if (log.durationMinutes) metrics.push(`${log.durationMinutes} min`);
  if (log.distanceKm) metrics.push(`${log.distanceKm} km`);
  if (paceLabel) metrics.push(paceLabel);
  if (log.avgHeartRate) metrics.push(`FC média ${log.avgHeartRate} bpm`);
  if (log.maxHeartRate) metrics.push(`FC máx ${log.maxHeartRate} bpm`);
  if (log.cadence) metrics.push(`cadência ${log.cadence}`);
  if (log.calories) metrics.push(`${log.calories} kcal`);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="shrink-0 text-xs capitalize text-muted-foreground">
            {dateLabel}
          </p>
        </div>
        {metrics.length > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {metrics.join(" · ")}
          </p>
        ) : null}
        {log.notes ? (
          <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        aria-label="Excluir registro"
        onClick={() => startTransition(async () => await deleteWorkoutLogAction(log.id))}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

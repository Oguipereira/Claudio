"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { toDateKey } from "@/domain/workouts/week";
import { AddWorkoutDialog } from "./add-workout-dialog";
import { WorkoutCard } from "./workout-card";

type PlannedWorkoutWithRelations = Prisma.PlannedWorkoutGetPayload<{
  include: { template: true; workoutLog: true };
}>;

type WorkoutTemplate = Prisma.WorkoutTemplateGetPayload<object>;

export function WeekView({
  days,
  plannedWorkouts,
  templates,
}: {
  days: Date[];
  plannedWorkouts: PlannedWorkoutWithRelations[];
  templates: WorkoutTemplate[];
}) {
  const [dialogDate, setDialogDate] = useState<string | null>(null);

  const byDay = new Map<string, PlannedWorkoutWithRelations[]>();
  for (const day of days) byDay.set(toDateKey(day), []);
  for (const workout of plannedWorkouts) {
    const key = toDateKey(workout.date);
    byDay.get(key)?.push(workout);
  }

  const today = toDateKey(new Date());

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const key = toDateKey(day);
          const workouts = byDay.get(key) ?? [];
          const isToday = key === today;

          return (
            <div
              key={key}
              className={`flex flex-col gap-2 rounded-lg border p-3 ${isToday ? "border-primary/50 bg-primary/5" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {format(day, "EEEEEE", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-semibold">
                    {format(day, "d 'de' MMM", { locale: ptBR })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDialogDate(key)}
                  aria-label="Adicionar treino"
                >
                  <Plus />
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {workouts.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Sem treinos
                  </p>
                ) : (
                  workouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddWorkoutDialog
        date={dialogDate}
        templates={templates}
        onOpenChange={(open) => !open && setDialogDate(null)}
      />
    </>
  );
}

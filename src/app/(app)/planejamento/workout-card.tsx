"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  MoreVertical,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { toDateKey } from "@/domain/workouts/week";
import { STATUS_LABEL } from "@/domain/workouts/labels";
import { CATEGORY_ICON } from "@/components/workout-category-icon";
import {
  deletePlannedWorkoutAction,
  updatePlannedWorkoutAction,
} from "./actions";

type PlannedWorkoutWithRelations = Prisma.PlannedWorkoutGetPayload<{
  include: { template: true; workoutLog: true };
}>;

const STATUS_VARIANT = {
  PLANNED: "outline",
  COMPLETED: "default",
  RESCHEDULED: "secondary",
  CANCELLED: "destructive",
} as const;

export function WorkoutCard({
  workout,
}: {
  workout: PlannedWorkoutWithRelations;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const Icon = CATEGORY_ICON[workout.category];
  const label = workout.template?.name ?? workout.adHocLabel ?? "Treino";
  const canComplete =
    workout.status === "PLANNED" || workout.status === "RESCHEDULED";

  function setStatus(status: "CANCELLED" | "PLANNED") {
    const formData = new FormData();
    formData.set("id", workout.id);
    formData.set("status", status);
    startTransition(() => {
      updatePlannedWorkoutAction({}, formData);
    });
  }

  function reschedule(date: Date | undefined) {
    if (!date) return;
    const formData = new FormData();
    formData.set("id", workout.id);
    formData.set("date", toDateKey(date));
    formData.set("status", "RESCHEDULED");
    startTransition(() => {
      updatePlannedWorkoutAction({}, formData);
    });
    setRescheduleOpen(false);
  }

  function handleDelete() {
    startTransition(() => {
      deletePlannedWorkoutAction(workout.id);
    });
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-card p-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <Badge variant={STATUS_VARIANT[workout.status]} className="mt-1">
          {STATUS_LABEL[workout.status]}
        </Badge>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              aria-label="Acoes do treino"
            />
          }
        >
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canComplete && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`/treinos/novo?plannedWorkoutId=${workout.id}`)
              }
            >
              <Check /> Concluir
            </DropdownMenuItem>
          )}
          {canComplete && (
            <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
              <CalendarClock /> Remarcar
            </DropdownMenuItem>
          )}
          {workout.status !== "CANCELLED" ? (
            <DropdownMenuItem onClick={() => setStatus("CANCELLED")}>
              <X /> Cancelar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setStatus("PLANNED")}>
              <RotateCcw /> Reabrir
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Remarcar treino</DialogTitle>
          </DialogHeader>
          <Calendar mode="single" selected={workout.date} onSelect={reschedule} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

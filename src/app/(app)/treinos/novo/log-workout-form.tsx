"use client";

import { useActionState } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { completeWorkoutAction, type LogWorkoutState } from "../actions";

type PlannedWorkoutWithTemplate = Prisma.PlannedWorkoutGetPayload<{
  include: { template: true };
}>;

const initialState: LogWorkoutState = {};

export function LogWorkoutForm({
  plannedWorkout,
}: {
  plannedWorkout: PlannedWorkoutWithTemplate;
}) {
  const [state, formAction, pending] = useActionState(
    completeWorkoutAction,
    initialState,
  );
  const isRunning = plannedWorkout.category === "RUNNING";

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <input
        type="hidden"
        name="plannedWorkoutId"
        value={plannedWorkout.id}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Duração (min)" name="durationMinutes" type="number" />
        <Field label="Calorias" name="calories" type="number" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="FC média" name="avgHeartRate" type="number" />
        {isRunning ? (
          <Field label="FC máxima" name="maxHeartRate" type="number" />
        ) : null}
      </div>

      {isRunning ? (
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Distância (km)"
            name="distanceKm"
            type="number"
            step="0.01"
          />
          <Field label="Ritmo (mm:ss)" name="pace" placeholder="5:30" />
        </div>
      ) : null}

      {isRunning ? (
        <Field label="Cadência (passos/min)" name="cadence" type="number" />
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Concluir treino"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        inputMode={type === "number" ? "decimal" : undefined}
      />
    </div>
  );
}

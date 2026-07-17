"use client";

import { useState, useTransition } from "react";
import { Target } from "lucide-react";
import type { NutritionGoal } from "@/generated/prisma/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setNutritionGoalAction } from "./actions";

export function GoalDialog({ goal }: { goal: NutritionGoal | null }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await setNutritionGoalAction({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon" aria-label="Definir metas" />}>
        <Target />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Metas diárias</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Calorias (kcal)" name="caloriesTarget" defaultValue={goal?.caloriesTarget} />
            <Field label="Proteína (g)" name="proteinTarget" defaultValue={goal?.proteinTarget} />
            <Field label="Carboidratos (g)" name="carbsTarget" defaultValue={goal?.carbsTarget} />
            <Field label="Gordura (g)" name="fatTarget" defaultValue={goal?.fatTarget} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar metas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        defaultValue={defaultValue}
        required
      />
    </div>
  );
}

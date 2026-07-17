"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { deleteFoodLogAction } from "./actions";

type FoodLogWithItem = Prisma.FoodLogGetPayload<{ include: { foodItem: true } }>;

export function FoodLogItem({ log }: { log: FoodLogWithItem }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{log.foodItem.name}</p>
          <p className="shrink-0 text-xs text-muted-foreground">{log.grams}g</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {Math.round(log.calories)} kcal · P {log.protein}g · C {log.carbs}g · G{" "}
          {log.fat}g
        </p>
        {log.notes ? (
          <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        aria-label="Excluir alimento"
        onClick={() => startTransition(() => deleteFoodLogAction(log.id))}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

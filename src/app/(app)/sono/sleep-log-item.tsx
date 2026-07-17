"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, Trash2 } from "lucide-react";
import type { SleepLog } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { fromPrismaDate } from "@/domain/date";
import { deleteSleepLogAction } from "./actions";
import { LogSleepDialog } from "./log-sleep-dialog";

export function SleepLogItem({ log }: { log: SleepLog }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium capitalize">
            {format(fromPrismaDate(log.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            {format(log.sleepAt, "HH:mm")} – {format(log.wakeAt, "HH:mm")}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{log.totalHours}h</span>
          <span className="flex items-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={
                  n <= log.quality
                    ? "size-3 fill-primary text-primary"
                    : "size-3 fill-none text-muted-foreground"
                }
              />
            ))}
          </span>
        </div>
        {log.notes ? (
          <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>
        ) : null}
      </div>
      <LogSleepDialog existing={log} />
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        aria-label="Excluir registro de sono"
        onClick={() => startTransition(() => deleteSleepLogAction(log.id))}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

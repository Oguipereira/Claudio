"use client";

import { useState, useTransition } from "react";
import { Moon, Plus } from "lucide-react";
import { format, subDays } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { fromPrismaDate, toDateKey } from "@/domain/date";
import { logSleepAction } from "./actions";
import { QualityInput } from "./quality-input";
import type { SleepLog } from "@/generated/prisma/client";

export function LogSleepDialog({ existing }: { existing?: SleepLog }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const defaultDate = existing
    ? toDateKey(fromPrismaDate(existing.date))
    : toDateKey(subDays(new Date(), 1));

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await logSleepAction({}, formData);
      if (result.error) setError(result.error);
      else {
        setError(undefined);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={existing ? "ghost" : "default"} size={existing ? "sm" : "default"} />
        }
      >
        {existing ? (
          "Editar"
        ) : (
          <>
            <Plus /> Registrar noite
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="size-4" /> Registrar sono
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Noite de</Label>
            <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sleepTime">Dormiu às</Label>
              <Input
                id="sleepTime"
                name="sleepTime"
                type="time"
                defaultValue={existing ? format(existing.sleepAt, "HH:mm") : "23:00"}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wakeTime">Acordou às</Label>
              <Input
                id="wakeTime"
                name="wakeTime"
                type="time"
                defaultValue={existing ? format(existing.wakeAt, "HH:mm") : "07:00"}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Qualidade</Label>
            <QualityInput defaultValue={existing?.quality ?? 3} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={existing?.notes ?? ""}
              placeholder="Acordei durante a noite, dormi mal, muito calor..."
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

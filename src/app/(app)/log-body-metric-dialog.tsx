"use client";

import { useState, useTransition } from "react";
import { Scale } from "lucide-react";
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
import { toDateKey } from "@/domain/date";
import { logBodyMetricAction } from "./body-metrics-actions";

export function LogBodyMetricDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await logBodyMetricAction({}, formData);
      if (result.error) setError(result.error);
      else {
        setError(undefined);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon" aria-label="Registrar peso e FC de repouso" />}>
        <Scale />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Peso e frequência cardíaca de repouso</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" name="date" type="date" defaultValue={toDateKey(new Date())} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="weightKg">Peso (kg)</Label>
              <Input id="weightKg" name="weightKg" type="number" step="0.1" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="restingHeartRate">FC repouso (bpm)</Label>
              <Input id="restingHeartRate" name="restingHeartRate" type="number" />
            </div>
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

"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importGarminCsvAction, type ImportState } from "./actions";

export function UploadCsvForm() {
  const [result, setResult] = useState<ImportState | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await importGarminCsvAction({}, formData);
      setResult(res);
      if (!res.error) formRef.current?.reset();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Label htmlFor="file">Arquivo CSV (Atividades do Garmin Connect)</Label>
          <Input id="file" name="file" type="file" accept=".csv" required />
        </div>
        <Button type="submit" disabled={pending}>
          <Upload /> {pending ? "Importando..." : "Importar"}
        </Button>
      </form>

      {result?.error ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}

      {result?.summary ? (
        <p className="text-sm text-muted-foreground">
          {result.summary.imported} atividades importadas, {result.summary.linked}{" "}
          vinculadas automaticamente a treinos registrados, {result.summary.skipped}{" "}
          já existiam e foram ignoradas.
        </p>
      ) : null}
    </div>
  );
}

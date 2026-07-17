"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Prisma } from "@/generated/prisma/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { parseDateKey } from "@/domain/workouts/week";
import { CATEGORY_LABEL } from "@/domain/workouts/labels";
import { addPlannedWorkoutAction } from "./actions";

type WorkoutTemplate = Prisma.WorkoutTemplateGetPayload<object>;

export function AddWorkoutDialog({
  date,
  templates,
  onOpenChange,
}: {
  date: string | null;
  templates: WorkoutTemplate[];
  onOpenChange: (open: boolean) => void;
}) {
  const [category, setCategory] = useState<keyof typeof CATEGORY_LABEL>("STRENGTH");
  const [templateId, setTemplateId] = useState<string>("");
  const [adHocLabel, setAdHocLabel] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const templatesForCategory = useMemo(
    () => templates.filter((t) => t.category === category),
    [templates, category],
  );

  function handleCategoryChange(value: string) {
    setCategory(value as keyof typeof CATEGORY_LABEL);
    setTemplateId("");
    setAdHocLabel("");
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addPlannedWorkoutAction({}, formData);
      if (result.error) setError(result.error);
      else {
        setError(undefined);
        onOpenChange(false);
      }
    });
  }

  if (!date) return null;

  return (
    <Dialog open={Boolean(date)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Adicionar treino —{" "}
            {format(parseDateKey(date), "d 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="category" value={category} />
          {templateId ? (
            <input type="hidden" name="templateId" value={templateId} />
          ) : null}

          <Tabs value={category} onValueChange={handleCategoryChange}>
            <TabsList className="w-full">
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <TabsTrigger key={value} value={value} className="flex-1">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2">
            <Label htmlFor="templateId">Modelo</Label>
            <Select
              value={templateId}
              onValueChange={(value) => setTemplateId(value ?? "")}
            >
              <SelectTrigger id="templateId" className="w-full">
                <SelectValue placeholder="Selecione um modelo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {templatesForCategory.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!templateId && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="adHocLabel">Ou nome do treino avulso</Label>
              <Input
                id="adHocLabel"
                name="adHocLabel"
                value={adHocLabel}
                onChange={(e) => setAdHocLabel(e.target.value)}
                placeholder="Ex: Treino livre"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

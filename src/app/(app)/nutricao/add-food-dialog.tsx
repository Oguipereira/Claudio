"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
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
import type { MealType } from "@/generated/prisma/client";
import {
  createCustomFoodAndLogAction,
  logFoodFromSearchAction,
  searchFoodsAction,
} from "./actions";
import type { FoodSearchResult } from "@/server/nutrition/food-search";

type CachedFoodItem = {
  id: string;
  name: string;
  caloriesPer100g: number;
};

type SelectedFood =
  | { kind: "cached"; item: CachedFoodItem }
  | { kind: "remote"; item: FoodSearchResult };

export function AddFoodDialog({
  meal,
  date,
}: {
  meal: MealType;
  date: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "custom">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    cached: CachedFoodItem[];
    remote: FoodSearchResult[];
  }>({ cached: [], remote: [] });
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SelectedFood | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const showResults = query.trim().length >= 2;

  useEffect(() => {
    if (!open || !showResults) return;
    const timeout = setTimeout(async () => {
      setSearching(true);
      const res = await searchFoodsAction(query);
      setResults(res);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, open, showResults]);

  function reset() {
    setOpen(false);
    setMode("search");
    setQuery("");
    setResults({ cached: [], remote: [] });
    setSelected(null);
    setError(undefined);
  }

  function handleSearchSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await logFoodFromSearchAction({}, formData);
      if (result.error) setError(result.error);
      else reset();
    });
  }

  function handleCustomSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createCustomFoodAndLogAction({}, formData);
      if (result.error) setError(result.error);
      else reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : reset())}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Plus /> Adicionar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar alimento</DialogTitle>
        </DialogHeader>

        {mode === "search" && !selected ? (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                className="pl-8"
                placeholder="Buscar alimento (ex: arroz, frango, aveia)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {showResults && searching ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Buscando...
                </p>
              ) : null}

              {showResults && !searching && results.cached.length === 0 && results.remote.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Nenhum alimento encontrado.
                </p>
              ) : null}

              {showResults
                ? results.cached.map((item) => (
                    <button
                      key={`cached-${item.id}`}
                      type="button"
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                      onClick={() => setSelected({ kind: "cached", item })}
                    >
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(item.caloriesPer100g)} kcal/100g
                      </span>
                    </button>
                  ))
                : null}

              {showResults
                ? results.remote.map((item) => (
                    <button
                      key={`${item.source}-${item.externalId}`}
                      type="button"
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                      onClick={() => setSelected({ kind: "remote", item })}
                    >
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(item.caloriesPer100g)} kcal/100g
                      </span>
                    </button>
                  ))
                : null}
            </div>

            <Button
              type="button"
              variant="link"
              className="self-start px-0"
              onClick={() => setMode("custom")}
            >
              Ou cadastrar alimento personalizado
            </Button>
          </div>
        ) : null}

        {mode === "search" && selected ? (
          <form action={handleSearchSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="mealType" value={meal} />
            {selected.kind === "cached" ? (
              <input type="hidden" name="foodItemId" value={selected.item.id} />
            ) : (
              <>
                <input type="hidden" name="source" value={selected.item.source} />
                <input type="hidden" name="externalId" value={selected.item.externalId} />
                <input type="hidden" name="name" value={selected.item.name} />
                <input type="hidden" name="caloriesPer100g" value={selected.item.caloriesPer100g} />
                <input type="hidden" name="proteinPer100g" value={selected.item.proteinPer100g} />
                <input type="hidden" name="carbsPer100g" value={selected.item.carbsPer100g} />
                <input type="hidden" name="fatPer100g" value={selected.item.fatPer100g} />
                {selected.item.fiberPer100g !== undefined ? (
                  <input type="hidden" name="fiberPer100g" value={selected.item.fiberPer100g} />
                ) : null}
              </>
            )}

            <p className="text-sm font-medium">{selected.item.name}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="grams">Peso (g)</Label>
                <Input id="grams" name="grams" type="number" step="0.1" required autoFocus />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="time">Horário</Label>
                <Input id="time" name="time" type="time" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                Voltar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {mode === "custom" ? (
          <form action={handleCustomSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="mealType" value={meal} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome do alimento</Label>
              <Input id="name" name="name" required autoFocus />
            </div>

            <p className="text-xs text-muted-foreground">
              Macros por 100g (rótulo ou tabela TACO/USDA)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Calorias (kcal)" name="caloriesPer100g" />
              <Field label="Proteína (g)" name="proteinPer100g" />
              <Field label="Carboidratos (g)" name="carbsPer100g" />
              <Field label="Gordura (g)" name="fatPer100g" />
              <Field label="Fibra (g)" name="fiberPer100g" required={false} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="grams">Peso (g)</Label>
                <Input id="grams" name="grams" type="number" step="0.1" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="time">Horário</Label>
                <Input id="time" name="time" type="time" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode("search")}>
                Voltar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  required = true,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="number" step="0.1" required={required} />
    </div>
  );
}

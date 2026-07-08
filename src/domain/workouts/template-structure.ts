import { z } from "zod";

/// Treinos de musculacao no momento sao definidos por grupos musculares-alvo
/// (o usuario nao fornece uma prescricao fixa de exercicios/series/repeticoes);
/// os exercicios efetivamente feitos ficam nas observacoes do WorkoutLog.
export const strengthStructureSchema = z.object({
  kind: z.literal("strength"),
  muscleGroups: z.array(z.string()).min(1),
});

export const hyroxBlockSchema = z.object({
  name: z.string(),
  rounds: z.number().int().positive(),
  station: z.string(),
  exercises: z.array(z.string()).min(1),
});

export const hyroxStructureSchema = z.object({
  kind: z.literal("hyrox"),
  blocks: z.array(hyroxBlockSchema).min(1),
});

export const runningStructureSchema = z.object({
  kind: z.literal("running"),
  targetDistanceKm: z.number().positive().optional(),
  description: z.string().optional(),
});

export const templateStructureSchema = z.discriminatedUnion("kind", [
  strengthStructureSchema,
  hyroxStructureSchema,
  runningStructureSchema,
]);

export type StrengthStructure = z.infer<typeof strengthStructureSchema>;
export type HyroxStructure = z.infer<typeof hyroxStructureSchema>;
export type RunningStructure = z.infer<typeof runningStructureSchema>;
export type TemplateStructure = z.infer<typeof templateStructureSchema>;

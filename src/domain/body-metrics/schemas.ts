import { z } from "zod";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida");

const optionalNumber = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  return v;
}, z.coerce.number().positive().optional());

export const logBodyMetricSchema = z
  .object({
    date: dateKeySchema,
    weightKg: optionalNumber,
    restingHeartRate: optionalNumber,
    notes: z.string().max(500).optional(),
  })
  .refine((v) => v.weightKg !== undefined || v.restingHeartRate !== undefined, {
    message: "Informe ao menos o peso ou a frequência cardíaca de repouso.",
  });

export type LogBodyMetricInput = z.infer<typeof logBodyMetricSchema>;

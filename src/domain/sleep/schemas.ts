import { z } from "zod";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida");
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Horario invalido");

export const logSleepSchema = z.object({
  date: dateKeySchema,
  sleepTime: timeSchema,
  wakeTime: timeSchema,
  quality: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

export type LogSleepInput = z.infer<typeof logSleepSchema>;

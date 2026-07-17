import { addDays, differenceInMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "@/domain/date";

export type SleepSession = {
  sleepAt: Date;
  wakeAt: Date;
  totalHours: number;
};

/// Calcula os horarios reais de inicio/fim do sono a partir da "noite" (data)
/// e dos horarios informados. Se o horario de acordar for menor ou igual ao
/// de dormir (caso tipico: dormiu 23:00, acordou 07:00), assume que acordou
/// no dia seguinte. Se for maior (ex: cochilo das 14:00 as 15:30), assume o
/// mesmo dia.
///
/// Os horarios digitados pelo usuario sao sempre no fuso dele (Brasil), mas
/// esta funcao roda no servidor (Vercel, fuso UTC) -- por isso usamos
/// fromZonedTime em vez de `new Date(...)`, que interpretaria "23:00" como
/// UTC e guardaria um horario 3h errado.
export function computeSleepSession(
  dateKey: string,
  sleepTime: string,
  wakeTime: string,
): SleepSession {
  const sleepAt = fromZonedTime(`${dateKey}T${sleepTime}:00`, APP_TIMEZONE);
  let wakeAt = fromZonedTime(`${dateKey}T${wakeTime}:00`, APP_TIMEZONE);

  if (wakeAt <= sleepAt) {
    wakeAt = addDays(wakeAt, 1);
  }

  const totalHours = Math.round((differenceInMinutes(wakeAt, sleepAt) / 60) * 100) / 100;

  return { sleepAt, wakeAt, totalHours };
}

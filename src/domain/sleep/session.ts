import { addDays, differenceInMinutes } from "date-fns";

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
export function computeSleepSession(
  dateKey: string,
  sleepTime: string,
  wakeTime: string,
): SleepSession {
  const sleepAt = new Date(`${dateKey}T${sleepTime}:00`);
  let wakeAt = new Date(`${dateKey}T${wakeTime}:00`);

  if (wakeAt <= sleepAt) {
    wakeAt = addDays(wakeAt, 1);
  }

  const totalHours = Math.round((differenceInMinutes(wakeAt, sleepAt) / 60) * 100) / 100;

  return { sleepAt, wakeAt, totalHours };
}

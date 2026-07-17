import { format, parseISO } from "date-fns";

/// Convencao de datas usada em todo o dominio: uma data "de calendario" e
/// sempre representada como meia-noite no fuso LOCAL (nunca UTC), para que
/// funcoes do date-fns operem de forma consistente independente do fuso do
/// processo (dev na maquina local x servidor na Vercel, que roda em UTC). A
/// conversao para/de UTC so acontece na fronteira com o Prisma (colunas
/// @db.Date), via toPrismaDate/fromPrismaDate.

/// Converte uma chave "yyyy-MM-dd" em uma data de calendario local (meia-noite local).
export function parseDateKey(key: string): Date {
  return parseISO(key);
}

/// Converte uma data de calendario local em uma chave "yyyy-MM-dd".
export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/// Converte uma data de calendario local para o valor UTC-meia-noite que deve
/// ser enviado a uma coluna @db.Date do Prisma/Postgres.
export function toPrismaDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/// Converte uma data vinda de uma coluna @db.Date (UTC-meia-noite) de volta
/// para uma data de calendario local, para uso com date-fns.
export function fromPrismaDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

import { format, parseISO, type Locale } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

/// Fuso horario do unico usuario do app. A Vercel roda funcoes serverless em
/// UTC por padrao (e nao permite configurar TZ via variavel de ambiente), e
/// nao ha como saber o fuso do navegador durante a renderizacao no servidor
/// -- entao fixamos explicitamente o fuso do usuario para qualquer horario
/// real (timestamps como `completedAt`, nao datas de calendario puras) que
/// precise ser exibido agrupado por "dia", evitando que um treino feito a
/// noite apareca com a data do dia seguinte.
export const APP_TIMEZONE = "America/Sao_Paulo";

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

/// Formata um horario real (timestamp, nao data de calendario pura) sempre
/// no fuso do usuario (APP_TIMEZONE), independente do fuso do processo que
/// esta rodando o codigo.
export function formatLocal(
  date: Date,
  pattern: string,
  options?: { locale?: Locale },
): string {
  return formatInTimeZone(date, APP_TIMEZONE, pattern, options);
}

/// Chave "yyyy-MM-dd" do dia de calendario (no fuso do usuario) em que um
/// horario real (timestamp, ex: WorkoutLog.completedAt) caiu. Use para
/// agrupar timestamps por "dia" (heatmap, series temporais) em vez de
/// toDateKey, que assume que a Date ja esta no fuso certo.
export function dateKeyInAppTimezone(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "yyyy-MM-dd");
}

/// "Agora", mas com os getters locais (getFullYear/getDate/getHours/...)
/// jah refletindo o fuso do usuario, mesmo rodando num processo em UTC. Use
/// isto em vez de `new Date()` sempre que o resultado for usado para decidir
/// "qual e o dia de hoje" (ex: getWeekStart, subDays) em codigo que roda no
/// servidor -- caso contrario, entre 21h e 23h59 no Brasil o servidor (UTC)
/// ja estaria no dia seguinte.
export function nowInAppTimezone(): Date {
  return toZonedTime(new Date(), APP_TIMEZONE);
}

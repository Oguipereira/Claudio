/// Sessao de acesso unico (single password) para uso pessoal: nao ha conta
/// de usuario nem cadastro, so uma senha fixa (APP_PASSWORD) e um cookie
/// assinado por HMAC (AUTH_SECRET) com prazo de expiracao. Usa Web Crypto
/// (globalThis.crypto.subtle) em vez de `node:crypto` para funcionar tanto
/// no runtime Node quanto no Edge, ja que o proxy.ts pode rodar em qualquer um.

export const SESSION_COOKIE_NAME = "session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET nao configurado.");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toHex(signature);
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_DURATION_MS;
  const payload = `exp=${exp}`;
  return `${payload}.${await sign(payload)}`;
}

export async function isValidSessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await sign(payload);
  if (signature !== expected) return false;

  const match = /^exp=(\d+)$/.exec(payload);
  if (!match) return false;

  return Number(match[1]) > Date.now();
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    throw new Error("APP_PASSWORD nao configurado.");
  }
  return input === expected;
}

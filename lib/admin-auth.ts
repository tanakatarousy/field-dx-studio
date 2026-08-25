const ADMIN_SESSION_COOKIE = "__Host-field_dx_admin";
const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;
const ADMIN_LABEL = "管理者";

type RuntimeEnv = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

type SessionPayload = {
  exp: number;
  iat: number;
  nonce: string;
  role: "admin";
  version: 1;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function exactArrayBuffer(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

function encodeBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): Uint8Array | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function constantTimeTextEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}

function sessionTokenFromCookieHeader(cookieHeader: string | null): string | null {
  for (const item of (cookieHeader ?? "").split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === ADMIN_SESSION_COOKIE) {
      return item.slice(separator + 1).trim() || null;
    }
  }
  return null;
}

async function runtimeEnv(): Promise<RuntimeEnv> {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    exactArrayBuffer(encoder.encode(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function verifiedSession(token: string | null): Promise<boolean> {
  if (!token) return false;
  const runtime = await runtimeEnv();
  const secret = runtime.ADMIN_SESSION_SECRET ?? "";
  if (secret.length < 32) return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const payloadBytes = decodeBase64Url(parts[1]);
  const signature = decodeBase64Url(parts[2]);
  if (!payloadBytes || !signature) return false;

  try {
    const payload = JSON.parse(decoder.decode(payloadBytes)) as Partial<SessionPayload>;
    const now = Math.floor(Date.now() / 1000);
    if (
      payload.version !== 1 ||
      payload.role !== "admin" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.iat > now + 60 ||
      payload.exp <= now ||
      payload.exp > payload.iat + ADMIN_SESSION_TTL_SECONDS ||
      typeof payload.nonce !== "string" ||
      payload.nonce.length < 16
    ) {
      return false;
    }

    return crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      exactArrayBuffer(signature),
      exactArrayBuffer(encoder.encode(`v1.${parts[1]}`)),
    );
  } catch {
    return false;
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = (await runtimeEnv()).ADMIN_PASSWORD ?? "";
  return (
    expected.length >= 16 &&
    password.length >= 16 &&
    password.length <= 256 &&
    constantTimeTextEqual(password, expected)
  );
}

export async function createAdminSessionCookie(): Promise<string | null> {
  const secret = (await runtimeEnv()).ADMIN_SESSION_SECRET ?? "";
  if (secret.length < 32) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    exp: now + ADMIN_SESSION_TTL_SECONDS,
    iat: now,
    nonce: encodeBase64Url(crypto.getRandomValues(new Uint8Array(18))),
    role: "admin",
    version: 1,
  };
  const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `v1.${encodedPayload}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      await hmacKey(secret),
      exactArrayBuffer(encoder.encode(signingInput)),
    ),
  );
  const token = `${signingInput}.${encodeBase64Url(signature)}`;
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; Max-Age=${ADMIN_SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export async function getAdminIdentityFromToken(token: string | undefined): Promise<string | null> {
  return await verifiedSession(token ?? null) ? ADMIN_LABEL : null;
}

export async function getAdminIdentityFromRequest(request: Request): Promise<string | null> {
  return await verifiedSession(sessionTokenFromCookieHeader(request.headers.get("cookie")))
    ? ADMIN_LABEL
    : null;
}

export async function requireAdminRequest(request: Request): Promise<Response | null> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !isSameOriginRequest(request)) {
    return Response.json(
      { error: "不正な送信元です。" },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  if (await getAdminIdentityFromRequest(request)) return null;
  return Response.json(
    { error: "管理者権限が必要です。" },
    { status: 403, headers: { "Cache-Control": "private, no-store" } },
  );
}

export { ADMIN_SESSION_COOKIE };

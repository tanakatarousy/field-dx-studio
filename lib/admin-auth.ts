const ACCESS_JWT_HEADER = "cf-access-jwt-assertion";

type RuntimeEnv = {
  ADMIN_EMAILS?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
};

type JwtHeader = {
  alg?: string;
  kid?: string;
};

type AccessClaims = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iss?: string;
  nbf?: number;
};

type Jwks = {
  keys?: Array<JsonWebKey & { alg?: string; kid?: string }>;
};

type HeaderSource = Pick<Headers, "get">;

function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
  } catch {
    return null;
  }
}

function exactArrayBuffer(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

function normalizeTeamDomain(value: string | undefined): { host: string; issuer: string } | null {
  const configured = value?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured.includes("://") ? configured : `https://${configured}`);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
    return { host: url.host, issuer: url.origin };
  } catch {
    return null;
  }
}

async function runtimeEnv(): Promise<RuntimeEnv> {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

async function verifiedAccessEmail(headers: HeaderSource): Promise<string | null> {
  const runtime = await runtimeEnv();
  const admins = new Set(list(runtime.ADMIN_EMAILS).map((email) => email.toLowerCase()));
  const audiences = new Set(list(runtime.CF_ACCESS_AUD));
  const team = normalizeTeamDomain(runtime.CF_ACCESS_TEAM_DOMAIN);
  const token = headers.get(ACCESS_JWT_HEADER)?.trim();

  if (!token || admins.size === 0 || audiences.size === 0 || !team) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header = decodeJson<JwtHeader>(parts[0]);
  const claims = decodeJson<AccessClaims>(parts[1]);
  if (!header || !claims || header.alg !== "RS256" || !header.kid) return null;

  const now = Math.floor(Date.now() / 1000);
  const tokenAudiences = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  const email = claims.email?.trim().toLowerCase() ?? "";
  if (
    claims.iss !== team.issuer ||
    typeof claims.exp !== "number" ||
    claims.exp <= now ||
    (typeof claims.nbf === "number" && claims.nbf > now + 60) ||
    !tokenAudiences.some((audience) => audiences.has(audience)) ||
    !admins.has(email)
  ) {
    return null;
  }

  try {
    const response = await fetch(`https://${team.host}/cdn-cgi/access/certs`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const jwks = (await response.json()) as Jwks;
    const jwk = jwks.keys?.find(
      (candidate) =>
        candidate.kid === header.kid &&
        candidate.kty === "RSA" &&
        (!candidate.alg || candidate.alg === "RS256"),
    );
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const verified = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      exactArrayBuffer(decodeBase64Url(parts[2])),
      exactArrayBuffer(new TextEncoder().encode(`${parts[0]}.${parts[1]}`)),
    );
    return verified ? email : null;
  } catch {
    return null;
  }
}

export async function getAdminEmailFromHeaders(headers: HeaderSource): Promise<string | null> {
  return verifiedAccessEmail(headers);
}

export async function getAdminEmailFromRequest(request: Request): Promise<string | null> {
  return verifiedAccessEmail(request.headers);
}

export async function requireAdminRequest(request: Request): Promise<Response | null> {
  if (await getAdminEmailFromRequest(request)) return null;
  return Response.json({ error: "管理者権限が必要です。" }, { status: 403 });
}

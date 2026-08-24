export async function getD1(): Promise<D1Database> {
  // Keep the Cloudflare-only module behind the request path so the packaged
  // Worker can also be inspected by the Node-based artifact validator.
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as { DB?: D1Database };
  if (!runtime.DB) throw new Error("Database binding is unavailable.");
  return runtime.DB;
}

export function japanDate(value = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

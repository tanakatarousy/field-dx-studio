import { getD1, japanDate } from "@/lib/d1";
import { getVisitorColor } from "@/lib/visitor-id";

type TrackPayload = {
  visitorId?: string;
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device?: string;
  browser?: string;
};

const TRACKED_PATHS = new Set(["/", "/services", "/growth", "/approach", "/contact"]);

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function referrerHost(value: unknown): string {
  const raw = text(value, 500);
  if (!raw) return "direct";
  try {
    return new URL(raw).hostname.slice(0, 180) || "direct";
  } catch {
    return "direct";
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TrackPayload;
    const visitorId = text(payload.visitorId, 90);
    const requestedPath = text(payload.path, 240) || "/";
    const path = TRACKED_PATHS.has(requestedPath) ? requestedPath : "/";

    if (!/^v_[a-zA-Z0-9-]{12,88}$/.test(visitorId)) {
      return Response.json({ error: "invalid visitor id" }, { status: 400 });
    }

    const db = await getD1();
    const referrer = referrerHost(payload.referrer);
    const utmSource = text(payload.utmSource, 100);
    const utmMedium = text(payload.utmMedium, 100);
    const utmCampaign = text(payload.utmCampaign, 140);
    const device = ["mobile", "tablet", "desktop"].includes(payload.device ?? "")
      ? payload.device!
      : "desktop";
    const browser = ["edge", "chrome", "safari", "firefox", "other"].includes(payload.browser ?? "")
      ? payload.browser!
      : "other";
    const country = text((request as Request & { cf?: { country?: string } }).cf?.country, 2).toUpperCase() || "unknown";

    await db.prepare(
      `INSERT OR IGNORE INTO visitors
       (id, color, first_referrer, first_utm_source, first_seen_at, last_seen_at, is_excluded)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)`,
    ).bind(visitorId, getVisitorColor(visitorId), referrer, utmSource).run();

    await db.batch([
      db.prepare("UPDATE visitors SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?").bind(visitorId),
      db.prepare(
        `INSERT INTO visits
         (visitor_id, path, referrer, utm_source, utm_medium, utm_campaign, device, browser, country, visit_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      ).bind(visitorId, path, referrer, utmSource, utmMedium, utmCampaign, device, browser, country, japanDate()),
    ]);

    return Response.json({ recorded: true });
  } catch {
    return Response.json({ error: "tracking unavailable" }, { status: 500 });
  }
}

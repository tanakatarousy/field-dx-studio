import { requireAdminRequest } from "@/lib/admin-auth";
import { getD1 } from "@/lib/d1";

type AdminAction = {
  action?: "set_excluded" | "update_consultation";
  visitorIds?: string[];
  excluded?: boolean;
  consultationId?: string;
  status?: string;
};

const VISITOR_ID = /^v_[a-zA-Z0-9-]{12,88}$/;

export async function GET(request: Request) {
  const denied = await requireAdminRequest(request);
  if (denied) return denied;

  try {
    const db = await getD1();
    const [summary, funnel, visitors, excludedVisitors, trend, pages, sources, recentVisits, consultations] = await Promise.all([
      db.prepare(
        `SELECT
           (SELECT COUNT(*) FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
             WHERE v.is_excluded = 0 AND vi.visit_date = date('now', '+9 hours')) AS todayViews,
           (SELECT COUNT(*) FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
             WHERE v.is_excluded = 0 AND vi.visit_date >= date('now', '+9 hours', '-6 days')) AS weekViews,
           (SELECT COUNT(DISTINCT vi.visitor_id) FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
             WHERE v.is_excluded = 0 AND vi.visit_date >= date('now', '+9 hours', '-6 days')) AS weekVisitors,
           (SELECT COUNT(*) FROM visitors WHERE is_excluded = 0) AS totalVisitors,
           (SELECT COUNT(*) FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
             WHERE v.is_excluded = 0) AS totalViews,
           (SELECT COUNT(*) FROM consultations) AS consultationCount,
           (SELECT COUNT(*) FROM consultations WHERE status = 'unread') AS unreadCount`,
      ).first(),
      db.prepare(
        `WITH top_visitors AS (
           SELECT DISTINCT vi.visitor_id
           FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
           WHERE v.is_excluded = 0
             AND vi.visit_date >= date('now', '+9 hours', '-6 days')
             AND vi.path = '/'
         ), progressed AS (
           SELECT DISTINCT vi.visitor_id
           FROM visits vi JOIN top_visitors tv ON tv.visitor_id = vi.visitor_id
           WHERE vi.visit_date >= date('now', '+9 hours', '-6 days') AND vi.path <> '/'
         )
         SELECT
           (SELECT COUNT(*) FROM top_visitors) AS topVisitors,
           (SELECT COUNT(*) FROM progressed) AS progressedVisitors`,
      ).first(),
      db.prepare(
        `SELECT v.id, v.color, v.first_seen_at AS firstSeenAt, v.last_seen_at AS lastSeenAt,
                v.first_referrer AS referrer, v.first_utm_source AS utmSource,
                COUNT(vi.id) AS pageViews,
                (SELECT c.company_name FROM consultations c WHERE c.visitor_id = v.id ORDER BY c.created_at DESC LIMIT 1) AS companyName,
                (SELECT c.contact_name FROM consultations c WHERE c.visitor_id = v.id ORDER BY c.created_at DESC LIMIT 1) AS contactName,
                (SELECT c.email FROM consultations c WHERE c.visitor_id = v.id ORDER BY c.created_at DESC LIMIT 1) AS email
         FROM visitors v LEFT JOIN visits vi ON vi.visitor_id = v.id
         WHERE v.is_excluded = 0
         GROUP BY v.id ORDER BY v.last_seen_at DESC LIMIT 80`,
      ).all(),
      db.prepare(
        `SELECT v.id, v.color, v.first_seen_at AS firstSeenAt, v.last_seen_at AS lastSeenAt,
                COUNT(vi.id) AS pageViews
         FROM visitors v LEFT JOIN visits vi ON vi.visitor_id = v.id
         WHERE v.is_excluded = 1
         GROUP BY v.id ORDER BY v.last_seen_at DESC LIMIT 40`,
      ).all(),
      db.prepare(
        `WITH RECURSIVE dates(day) AS (
           SELECT date('now', '+9 hours', '-13 days')
           UNION ALL SELECT date(day, '+1 day') FROM dates WHERE day < date('now', '+9 hours')
         ), eligible AS (
           SELECT vi.id, vi.visitor_id, vi.visit_date
           FROM visits vi JOIN visitors v ON v.id = vi.visitor_id WHERE v.is_excluded = 0
         )
         SELECT dates.day, COUNT(DISTINCT eligible.visitor_id) AS visitors, COUNT(eligible.id) AS views
         FROM dates LEFT JOIN eligible ON eligible.visit_date = dates.day
         GROUP BY dates.day ORDER BY dates.day`,
      ).all(),
      db.prepare(
        `SELECT vi.path, COUNT(*) AS views, COUNT(DISTINCT vi.visitor_id) AS visitors
         FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
         WHERE v.is_excluded = 0 AND vi.visit_date >= date('now', '+9 hours', '-6 days')
         GROUP BY vi.path ORDER BY visitors DESC, views DESC LIMIT 12`,
      ).all(),
      db.prepare(
        `SELECT CASE WHEN vi.utm_source <> '' THEN vi.utm_source ELSE vi.referrer END AS source,
                COUNT(*) AS views, COUNT(DISTINCT vi.visitor_id) AS visitors
         FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
         WHERE v.is_excluded = 0 AND vi.visit_date >= date('now', '+9 hours', '-6 days')
         GROUP BY source ORDER BY visitors DESC, views DESC LIMIT 12`,
      ).all(),
      db.prepare(
        `SELECT vi.id, vi.visitor_id AS visitorId, vi.path, vi.referrer, vi.device,
                vi.browser, vi.country, vi.created_at AS createdAt, v.color,
                v.first_seen_at AS firstSeenAt,
                (SELECT COUNT(*) FROM visits all_visits WHERE all_visits.visitor_id = vi.visitor_id) AS pageViews,
                (SELECT c.company_name FROM consultations c WHERE c.visitor_id = vi.visitor_id ORDER BY c.created_at DESC LIMIT 1) AS companyName,
                (SELECT c.contact_name FROM consultations c WHERE c.visitor_id = vi.visitor_id ORDER BY c.created_at DESC LIMIT 1) AS contactName,
                (SELECT c.email FROM consultations c WHERE c.visitor_id = vi.visitor_id ORDER BY c.created_at DESC LIMIT 1) AS email
         FROM visits vi JOIN visitors v ON v.id = vi.visitor_id
         WHERE v.is_excluded = 0
         ORDER BY vi.created_at DESC, vi.id DESC LIMIT 200`,
      ).all(),
      db.prepare(
        `SELECT c.id, c.visitor_id AS visitorId, c.company_name AS companyName,
                c.contact_name AS contactName, c.email, c.phone, c.interest, c.message,
                c.status, c.created_at AS createdAt, c.updated_at AS updatedAt,
                COALESCE(v.color, '#66717c') AS visitorColor
         FROM consultations c LEFT JOIN visitors v ON v.id = c.visitor_id
         ORDER BY c.created_at DESC LIMIT 100`,
      ).all(),
    ]);

    return Response.json({
      summary,
      funnel,
      visitors: visitors.results,
      excludedVisitors: excludedVisitors.results,
      trend: trend.results,
      pages: pages.results,
      sources: sources.results,
      recentVisits: recentVisits.results,
      consultations: consultations.results,
      countingRule: "閲覧数は各アクセス、ユーザー数は匿名IDの重複を除外して集計",
    });
  } catch {
    return Response.json({ error: "管理データを読み込めませんでした。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdminRequest(request);
  if (denied) return denied;

  try {
    const payload = (await request.json()) as AdminAction;
    const db = await getD1();

    if (payload.action === "set_excluded") {
      const visitorIds = [...new Set(payload.visitorIds ?? [])].slice(0, 40);
      if (visitorIds.length === 0 || visitorIds.some((id) => !VISITOR_ID.test(id))) {
        return Response.json({ error: "除外するIDを確認してください。" }, { status: 400 });
      }
      await db.batch(visitorIds.map((id) => db.prepare(
        "UPDATE visitors SET is_excluded = ? WHERE id = ?",
      ).bind(payload.excluded ? 1 : 0, id)));
      return Response.json({ updated: true });
    }

    if (payload.action === "update_consultation") {
      const id = payload.consultationId?.trim() ?? "";
      const status = payload.status?.trim() ?? "";
      if (!id.startsWith("c_") || !["unread", "contacted", "closed"].includes(status)) {
        return Response.json({ error: "更新内容を確認してください。" }, { status: 400 });
      }
      await db.prepare(
        "UPDATE consultations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ).bind(status, id).run();
      return Response.json({ updated: true });
    }

    return Response.json({ error: "操作を確認してください。" }, { status: 400 });
  } catch {
    return Response.json({ error: "更新できませんでした。" }, { status: 500 });
  }
}

import { getD1 } from "@/lib/d1";

type ConsultationPayload = {
  visitorId?: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
  website?: string;
};

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ConsultationPayload;
    if (text(payload.website, 200)) return Response.json({ accepted: true });

    const visitorId = text(payload.visitorId, 90);
    const companyName = text(payload.companyName, 120);
    const contactName = text(payload.contactName, 80);
    const email = text(payload.email, 180).toLowerCase();
    const phone = text(payload.phone, 40);
    const interest = text(payload.interest, 100);
    const message = text(payload.message, 3000);

    if (!/^v_[a-zA-Z0-9-]{12,88}$/.test(visitorId)) {
      return Response.json({ error: "ページを再読み込みしてからお試しください。" }, { status: 400 });
    }
    if (!contactName || !interest || message.length < 10 || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "必須項目を確認してください。" }, { status: 400 });
    }

    const db = await getD1();
    const recent = await db.prepare(
      "SELECT COUNT(*) AS count FROM consultations WHERE visitor_id = ? AND created_at >= datetime('now', '-10 minutes')",
    ).bind(visitorId).first<{ count: number }>();
    if ((recent?.count ?? 0) >= 2) {
      return Response.json({ error: "短時間に複数回送信されています。しばらくしてからお試しください。" }, { status: 429 });
    }

    const id = `c_${crypto.randomUUID()}`;
    await db.prepare(
      `INSERT INTO consultations
       (id, visitor_id, company_name, contact_name, email, phone, interest, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    ).bind(id, visitorId, companyName, contactName, email, phone, interest, message).run();

    return Response.json({ accepted: true, reference: id.slice(-8) }, { status: 201 });
  } catch {
    return Response.json({ error: "送信内容を保存できませんでした。時間をおいてお試しください。" }, { status: 500 });
  }
}

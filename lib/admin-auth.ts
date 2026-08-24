const USER_EMAIL_HEADER = "oai-authenticated-user-email";

async function configuredAdminEmails(): Promise<string[]> {
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as { ADMIN_EMAILS?: string };
  return (runtime.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminEmail(email: string): Promise<boolean> {
  return (await configuredAdminEmails()).includes(email.trim().toLowerCase());
}

export async function getAdminEmailFromRequest(request: Request): Promise<string | null> {
  const email = request.headers.get(USER_EMAIL_HEADER)?.trim().toLowerCase() ?? "";
  return email && await isAdminEmail(email) ? email : null;
}

export async function requireAdminRequest(request: Request): Promise<Response | null> {
  if (await getAdminEmailFromRequest(request)) return null;
  return Response.json({ error: "管理者権限が必要です。" }, { status: 403 });
}

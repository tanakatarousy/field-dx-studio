import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAdminEmailFromHeaders } from "@/lib/admin-auth";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理画面｜つなぐ開発",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const requestHeaders = await headers();
  const adminEmail = await getAdminEmailFromHeaders(requestHeaders);

  if (!adminEmail) {
    return (
      <main className="admin-shell admin-denied">
        <p>管理者認証が必要です。</p>
        <p>Cloudflare Accessで許可された管理者アカウントから開いてください。</p>
        <a href="/">公開サイトへ戻る</a>
      </main>
    );
  }

  return <AdminDashboard displayName={adminEmail} />;
}

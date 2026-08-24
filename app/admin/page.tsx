import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理画面｜つなぐ開発",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");

  if (!(await isAdminEmail(user.email))) {
    return (
      <main className="admin-shell admin-denied">
        <p>このアカウントには管理権限がありません。</p>
        <a href={chatGPTSignOutPath("/admin")}>別のアカウントで入り直す</a>
      </main>
    );
  }

  return <AdminDashboard displayName={user.displayName} />;
}

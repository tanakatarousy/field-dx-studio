import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, getAdminIdentityFromToken } from "@/lib/admin-auth";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理画面｜つなぐ開発",
  robots: { index: false, follow: false },
};

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const cookieStore = await cookies();
  const identity = await getAdminIdentityFromToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!identity) {
    const { error } = await searchParams;
    return (
      <main className="admin-shell admin-denied">
        <section className="admin-login-card">
          <small>ADMIN CONSOLE</small>
          <h1>管理者ログイン</h1>
          <p>管理用パスワードを入力してください。ログイン状態は8時間で自動的に失効します。</p>
          <form action="/api/admin/session" method="post">
            <label htmlFor="admin-password">管理用パスワード</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              minLength={16}
              maxLength={256}
              autoComplete="current-password"
              required
              autoFocus
            />
            <button type="submit">ログイン</button>
          </form>
          {error === "invalid" && <p className="admin-login-error">パスワードが正しくありません。</p>}
          {error === "setup" && <p className="admin-login-error">管理者認証のSecret設定を確認してください。</p>}
          <a href="/">公開サイトへ戻る</a>
        </section>
      </main>
    );
  }

  return <AdminDashboard displayName={identity} />;
}

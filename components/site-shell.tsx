import { AnalyticsTracker } from "@/components/analytics-tracker";
import Image from "next/image";
import Link from "next/link";

const mainRoutes = [
  ["/#problems", "よくある課題"],
  ["/#services", "導入できるもの"],
  ["/works", "実績"],
  ["/#approach", "進め方"],
] as const;

const footerRoutes = [...mainRoutes, ["/#contact", "相談する"]] as const;

export function Brand() {
  return (
    <span className="brand-v2">
      <Image className="brand-logo brand-logo-color" src="/brand/logo-primary.png?v=3" alt="つなぐ開発 DX & SYSTEM DEVELOPMENT" width={685} height={168} unoptimized />
      <Image className="brand-logo brand-logo-mono" src="/brand/logo-monochrome.png?v=3" alt="" width={685} height={168} unoptimized />
    </span>
  );
}

export function SiteShell({ active, home = false, children }: { active?: string; home?: boolean; children: React.ReactNode }) {
  return (
    <main className={`public-page ${home ? "is-home" : ""}`} id="main-content">
      <AnalyticsTracker />
      <a className="skip-link" href="#page-body">本文へ移動</a>
      <header className={`public-header ${home ? "is-overlay" : ""}`}>
        <Link href="/" aria-label="つなぐ開発 トップへ"><Brand /></Link>
        <nav aria-label="メインナビゲーション">
          {mainRoutes.map(([href, label]) => <Link href={href} className={active === href ? "is-active" : ""} key={href}>{label}</Link>)}
        </nav>
        <Link className="public-header-cta" href="/#contact">相談する <span aria-hidden="true">↓</span></Link>
      </header>
      {children}
      <footer className="public-footer">
        <Brand />
        <p>問い合わせ、予約、顧客管理、集計。<br />手作業を、使える仕組みへ変えます。</p>
        <nav aria-label="フッターナビゲーション">{footerRoutes.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
        <small>© 2026 つなぐ開発</small>
      </footer>
    </main>
  );
}

export function PageIntro({ number, eyebrow, title, lead }: { number: string; eyebrow: string; title: React.ReactNode; lead: string }) {
  return (
    <section className="page-intro" id="page-body">
      <p className="page-number">{number}</p>
      <div><p className="eyebrow light"><span /> {eyebrow}</p><h1>{title}</h1></div>
      <p className="page-intro-lead">{lead}</p>
    </section>
  );
}

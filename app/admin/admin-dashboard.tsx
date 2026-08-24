"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

type Summary = {
  todayViews: number;
  weekViews: number;
  weekVisitors: number;
  totalVisitors: number;
  totalViews: number;
  consultationCount: number;
  unreadCount: number;
};
type Funnel = { topVisitors: number; progressedVisitors: number };
type Visitor = {
  id: string;
  color: string;
  firstSeenAt: string;
  lastSeenAt: string;
  referrer?: string;
  utmSource?: string;
  pageViews: number;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
};
type Trend = { day: string; visitors: number; views: number };
type Ranking = { path?: string; source?: string; views: number; visitors: number };
type RecentVisit = {
  id: number;
  visitorId: string;
  path: string;
  referrer: string;
  device: string;
  browser: string;
  country: string;
  createdAt: string;
  color: string;
  firstSeenAt: string;
  pageViews: number;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
};
type Consultation = {
  id: string;
  visitorId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  status: string;
  createdAt: string;
  visitorColor: string;
};
type DashboardData = {
  summary: Summary;
  funnel: Funnel;
  visitors: Visitor[];
  excludedVisitors: Visitor[];
  trend: Trend[];
  pages: Ranking[];
  sources: Ranking[];
  recentVisits: RecentVisit[];
  consultations: Consultation[];
  countingRule: string;
};

function number(value: number | string | undefined) {
  return Number(value ?? 0).toLocaleString("ja-JP");
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(`${value.replace(" ", "T")}Z`));
}

function visitorCode(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

function pageName(path: string) {
  const names: Record<string, string> = {
    "/": "トップ",
    "/services": "提供サービス",
    "/growth": "SEO・アクセス改善",
    "/approach": "進め方",
    "/contact": "相談フォーム",
  };
  return names[path] ?? path;
}

function deviceName(value: string) {
  return value === "mobile" ? "スマホ" : value === "tablet" ? "タブレット" : "PC";
}

function browserName(value: string) {
  const names: Record<string, string> = { edge: "Edge", chrome: "Chrome", safari: "Safari", firefox: "Firefox", other: "その他" };
  return names[value] ?? "その他";
}

function subscribeToVisitorId() {
  return () => undefined;
}

function VisitorBadge({ visitor, currentId, compact = false }: { visitor: Pick<Visitor, "id" | "color" | "pageViews" | "contactName" | "companyName" | "email">; currentId?: string; compact?: boolean }) {
  const identified = visitor.contactName || visitor.companyName;
  return (
    <span className={`visitor-badge${compact ? " compact" : ""}`} style={{ "--visitor-color": visitor.color } as React.CSSProperties}>
      <i />
      <span>
        <b>{identified || `訪問者 ${visitorCode(visitor.id)}`}</b>
        {!compact && <small>{identified ? visitor.email : `${number(visitor.pageViews)}件閲覧`}</small>}
      </span>
      {visitor.id === currentId && <em>この端末</em>}
    </span>
  );
}

export function AdminDashboard({ displayName }: { displayName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<"analytics" | "consultations">("analytics");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentVisitorId = useSyncExternalStore(subscribeToVisitorId, getOrCreateVisitorId, () => "");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin", { cache: "no-store" });
      const result = (await response.json()) as DashboardData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "読み込めませんでした。");
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "読み込めませんでした。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  const maxTrend = useMemo(
    () => Math.max(1, ...(data?.trend.map((item) => Number(item.views)) ?? [1])),
    [data],
  );
  const topVisitors = Number(data?.funnel.topVisitors ?? 0);
  const progressed = Number(data?.funnel.progressedVisitors ?? 0);
  const progressRate = topVisitors ? Math.round((progressed / topVisitors) * 100) : 0;

  async function setExcluded(visitorIds: string[], excluded: boolean) {
    setError("");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_excluded", visitorIds, excluded }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "更新できませんでした。");
      setSelectionMode(false);
      setSelectedIds(new Set());
      await load();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "更新できませんでした。");
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function closeSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_consultation", consultationId: id, status }),
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "更新できませんでした。");
      return;
    }
    await load();
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><Link href="/" className="admin-brand">現場DX設計室</Link><span>ADMIN CONSOLE</span></div>
        <div className="admin-account"><span>{displayName}</span><a href="/signout-with-chatgpt?return_to=/">ログアウト</a></div>
      </header>

      <section className="admin-titlebar">
        <div><p>管理者用</p><h1>公開サイトの閲覧履歴</h1><span>匿名の訪問者、再訪、問い合わせ後の相手と閲覧箇所を確認できます。</span></div>
        <div className="admin-title-actions"><Link href="/">公開サイトを見る</Link><button type="button" onClick={() => void load()} disabled={loading}>{loading ? "更新中" : "再読み込み"}</button></div>
      </section>

      <nav className="admin-tabs" aria-label="管理画面メニュー">
        <button className={tab === "analytics" ? "is-active" : ""} onClick={() => setTab("analytics")}>アクセス分析</button>
        <button className={tab === "consultations" ? "is-active" : ""} onClick={() => setTab("consultations")}>相談内容 <span>{data?.summary.unreadCount ?? 0}</span></button>
      </nav>
      {error && <p className="admin-error">{error}</p>}
      {loading && !data && <p className="admin-loading">管理データを読み込んでいます…</p>}

      {tab === "analytics" && data && (
        <>
          <section className="admin-metrics admin-metrics-five">
            <article><small>今日の閲覧</small><b>{number(data.summary.todayViews)}</b></article>
            <article><small>直近7日の閲覧</small><b>{number(data.summary.weekViews)}</b></article>
            <article><small>直近7日のユーザー</small><b>{number(data.summary.weekVisitors)}</b></article>
            <article><small>累計ユーザー数</small><b>{number(data.summary.totalVisitors)}</b><span>IDの重複を除外</span></article>
            <article><small>累計閲覧</small><b>{number(data.summary.totalViews)}</b></article>
          </section>

          <section className="admin-panel funnel-panel">
            <div className="panel-heading"><div><small>AFTER TOP</small><h2>トップページの次の行動</h2></div><p>直近7日・訪問者IDの重複なし</p></div>
            <p className="panel-intro">トップ到達後に、サービス・Web改善・相談フォームのいずれかまで進んだかを集計します。</p>
            <div className="funnel-metrics">
              <article><small>トップ到達者</small><b>{number(topVisitors)}</b><span>人</span></article>
              <article><small>次の内容へ進んだ</small><b>{number(progressed)}</b><span>人</span></article>
              <article><small>トップのみ</small><b>{number(Math.max(0, topVisitors - progressed))}</b><span>人</span></article>
              <article><small>次の内容への到達率</small><b>{progressRate}</b><span>%</span></article>
            </div>
            <div className="identity-note"><b>「誰が見たか」の確認範囲</b><p>問い合わせ前は同じブラウザを匿名IDで見分けます。問い合わせ送信後は、同じブラウザの閲覧履歴に会社名・氏名・メールを結び付けて表示します。</p><small>IPアドレスは保存しません。別端末・別ブラウザ、またはブラウザデータ削除後は別の訪問者になります。</small></div>
          </section>

          <section className="admin-panel own-access-panel">
            <div className="panel-heading"><div><small>OWNER FILTER</small><h2>自分のアクセス</h2></div><p>記録は残し、すべての集計から除外</p></div>
            <p className="panel-intro">自分の匿名IDを選ぶと、過去分を含めて閲覧数・ユーザー数・ランキング・最新履歴から外れます。解除すれば過去分も戻ります。</p>
            <div className="excluded-list">
              {data.excludedVisitors.length === 0 && <span className="muted-empty">現在、除外中のIDはありません。</span>}
              {data.excludedVisitors.map((visitor) => (
                <div className="excluded-chip" key={visitor.id}>
                  <VisitorBadge visitor={visitor} currentId={currentVisitorId} compact />
                  <button type="button" onClick={() => void setExcluded([visitor.id], false)}>除外を解除</button>
                </div>
              ))}
            </div>
            <div className="selection-controls">
              {!selectionMode ? (
                <><span>自分の閲覧を集計から外す場合だけ、選択モードを開きます。</span><button type="button" onClick={() => setSelectionMode(true)}>自分のIDを除外する</button></>
              ) : (
                <><span>{selectedIds.size ? `${selectedIds.size}件を選択中` : "下の訪問者から自分のIDを選択してください。"}</span><div><button className="button-secondary" type="button" onClick={closeSelection}>キャンセル</button><button type="button" disabled={selectedIds.size === 0} onClick={() => void setExcluded([...selectedIds], true)}>選択したIDを除外</button></div></>
              )}
            </div>
          </section>

          <section className="admin-panel visitor-cards-panel">
            <div className="panel-heading"><div><small>RECENT VISITORS</small><h2>最近の訪問者</h2></div><p>問い合わせとの紐付け</p></div>
            <div className="visitor-card-grid">
              {data.visitors.slice(0, 24).map((visitor) => (
                <article className={`visitor-card${selectedIds.has(visitor.id) ? " selected" : ""}`} key={visitor.id} style={{ "--visitor-color": visitor.color } as React.CSSProperties}>
                  {selectionMode && <label className="visitor-check"><input type="checkbox" checked={selectedIds.has(visitor.id)} onChange={() => toggleSelection(visitor.id)} /><span>自分のIDとして選択</span></label>}
                  <VisitorBadge visitor={visitor} currentId={currentVisitorId} />
                  <div className="visitor-times"><span>初回 {dateTime(visitor.firstSeenAt)}</span><span>最終 {dateTime(visitor.lastSeenAt)}</span></div>
                  {visitor.contactName && <button className="inquiry-linked" type="button" onClick={() => setTab("consultations")}>問い合わせ済み</button>}
                </article>
              ))}
            </div>
          </section>

          <section className="admin-panel trend-panel">
            <div className="panel-heading"><div><small>LAST 14 DAYS</small><h2>訪問の推移</h2></div><p>{data.countingRule}</p></div>
            <div className="trend-chart">
              {data.trend.map((item) => (
                <div className="trend-column" key={item.day} title={`${item.day}：${item.visitors}人／${item.views}閲覧`}>
                  <span>{item.views}</span><i style={{ height: `${Math.max(4, (Number(item.views) / maxTrend) * 100)}%` }} /><small>{item.day.slice(5).replace("-", "/")}</small>
                </div>
              ))}
            </div>
          </section>

          <div className="admin-grid-two">
            <section className="admin-panel"><div className="panel-heading"><div><small>PAGE · 7 DAYS</small><h2>よく見られている箇所</h2></div></div><div className="ranking-list">{data.pages.map((item, index) => <div key={item.path}><i>{index + 1}</i><b>{pageName(item.path ?? "/")}</b><span>{item.visitors}人・{item.views}回</span></div>)}</div></section>
            <section className="admin-panel"><div className="panel-heading"><div><small>SOURCE · 7 DAYS</small><h2>流入元</h2></div></div><div className="ranking-list">{data.sources.map((item, index) => <div key={item.source}><i>{index + 1}</i><b>{item.source === "direct" || !item.source ? "直接アクセス" : item.source}</b><span>{item.visitors}人・{item.views}回</span></div>)}</div></section>
          </div>

          <section className="admin-panel latest-panel">
            <div className="panel-heading"><div><small>LATEST · MAX 200</small><h2>最新の閲覧</h2></div><p>同じ色は同じ訪問者</p></div>
            <div className="latest-table">
              <div className="latest-row latest-head"><span>閲覧者</span><span>日時</span><span>ページ</span><span>参照元</span><span>環境</span></div>
              {data.recentVisits.map((visit) => (
                <div className="latest-row" key={visit.id}>
                  <VisitorBadge visitor={{ id: visit.visitorId, color: visit.color, pageViews: visit.pageViews, companyName: visit.companyName, contactName: visit.contactName, email: visit.email }} currentId={currentVisitorId} compact />
                  <span>{dateTime(visit.createdAt)}</span><b>{pageName(visit.path)}</b><span>{visit.referrer === "direct" ? "直接アクセス" : visit.referrer}</span><span>{visit.country === "unknown" ? "--" : visit.country}・{deviceName(visit.device)}・{browserName(visit.browser)}</span>
                </div>
              ))}
            </div>
            <p className="history-note">訪問者IDは個人そのものを特定する情報ではありません。「自分」として除外しても記録自体は削除されず、解除すると過去分も再び集計されます。</p>
          </section>
        </>
      )}

      {tab === "consultations" && data && (
        <section className="admin-panel consultations-panel">
          <div className="panel-heading"><div><small>CONSULTATIONS</small><h2>保存された相談内容</h2></div><p>{data.consultations.length}件</p></div>
          <div className="consultation-list">
            {data.consultations.length === 0 && <p className="empty-state">まだ相談は届いていません。</p>}
            {data.consultations.map((item) => (
              <article className={`consultation-card status-${item.status}`} key={item.id} style={{ borderLeftColor: item.status === "unread" ? undefined : item.visitorColor }}>
                <div className="consultation-meta"><span>{dateTime(item.createdAt)}</span><span>訪問者 {visitorCode(item.visitorId)}</span></div>
                <div className="consultation-main"><div><small>{item.companyName || "個人・会社名未入力"}</small><h3>{item.contactName}</h3><p>{item.interest}</p></div><select aria-label="対応状況" value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value)}><option value="unread">未確認</option><option value="contacted">連絡済み</option><option value="closed">完了</option></select></div>
                <div className="consultation-contact"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div>
                <p className="consultation-message">{item.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

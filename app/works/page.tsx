import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { WorksList } from "@/components/works-list";
import { canonicalUrl, jsonLd, pageMetadata } from "@/app/seo";
import { works } from "@/data/works";

export const metadata: Metadata = pageMetadata("/works","開発実績・業務改善事例 | つなぐ開発","業務自動化、データ収集、API連携、通知システム、既存システム改修など、つなぐ開発が実際に対応した開発事例をご紹介します。");

const fields = [
  ["業務自動化", "定型作業、転記、集計、通知などを自動化"],
  ["データ収集", "Web上の情報を定期取得し、必要な形へ整理"],
  ["通知・監視", "条件に一致した場合だけ担当者へ通知"],
  ["API・外部連携", "Google、Slack、LINEなど既存サービスを接続"],
  ["Web・業務システム", "業務に合わせた受付・処理・管理機能を構築"],
  ["既存システム改修", "現在動いている仕組みに必要な機能を追加"],
] as const;

export default function WorksPage() {
  const listJsonLd={"@context":"https://schema.org","@type":"ItemList",name:"開発実績・業務改善事例",itemListElement:works.map((work,index)=>({"@type":"ListItem",position:index+1,name:work.seoTitle,url:canonicalUrl(`/works/${work.slug}`)}))};
  return (
    <SiteShell active="/works">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(listJsonLd)}} />
      <section className="works-hero" id="page-body">
        <div className="works-hero-copy">
          <p className="works-kicker">WORKS</p>
          <h1>業務を、<br />仕組みに変えた事例。</h1>
          <p>業務自動化、データ収集、通知システム、外部サービス連携、既存システム改修など、実際に対応した事例をご紹介します。</p>
          <small>守秘義務のある案件は、企業名や固有情報を伏せて掲載しています。</small>
        </div>
        <div className="works-hero-flow" aria-label="業務改善の流れ">
          {[
            ["01", "取得"], ["02", "整理"], ["03", "判定"], ["04", "通知"],
          ].map(([number, label]) => <div key={number}><span>{number}</span><b>{label}</b></div>)}
        </div>
      </section>

      <section className="works-fields">
        <div className="works-section-head"><div><p className="works-kicker">CAPABILITIES</p><h2>対応してきた領域</h2></div></div>
        <div className="works-field-grid">
          {fields.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <WorksList />

      <section className="works-process">
        <div className="works-process-copy"><p className="works-kicker">FROM RESEARCH TO OPERATION</p><h2>開発だけで終わらせません。</h2><p>案件に応じて、現在の業務や既存環境の確認から、設計、実装、テスト、導入後の運用改善まで対応してきました。</p></div>
        <ol>{["確認", "設計", "実装", "テスト", "導入", "改善"].map((step, index) => <li key={step}><span>0{index + 1}</span><b>{step}</b></li>)}</ol>
        <p className="works-other">その他、データ収集・業務自動化・既存システム改修などの受託開発にも対応しています。</p>
      </section>

      <section className="works-cta">
        <div><p className="works-kicker">CONTACT</p><h2>同じ仕組みを、そのまま<br />作る必要はありません。</h2></div>
        <div><p>今の業務や使っているツールを確認し、必要な部分だけ整理してご提案します。仕様書がなくてもご相談いただけます。</p><Link href="/#contact">相談する <span aria-hidden="true">→</span></Link></div>
      </section>
    </SiteShell>
  );
}

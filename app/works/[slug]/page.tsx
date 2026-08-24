import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getWork, works, type Work } from "@/data/works";
import { canonicalUrl, jsonLd, pageMetadata } from "@/app/seo";

type WorkPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  const title = `${work.seoTitle} | 開発実績 | つなぐ開発`;
  return pageMetadata(`/works/${work.slug}`,title,work.summary,false);
}

function DetailList({ items }: { items: string[] }) {
  return <ul className="work-detail-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function ProcessFlow({ work, large = false }: { work: Work; large?: boolean }) {
  return (
    <ol className={`work-detail-flow ${large ? "is-large" : ""}`} aria-label={`${work.title}の処理の流れ`}>
      {work.flow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></li>)}
    </ol>
  );
}

export default async function WorkDetailPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const related = works
    .filter((candidate) => candidate.slug !== work.slug)
    .sort((a, b) => {
      const aScore = a.categories.filter((category) => work.categories.includes(category)).length;
      const bScore = b.categories.filter((category) => work.categories.includes(category)).length;
      return bScore - aScore;
    })
    .slice(0, 3);

  const beforeSteps = work.challenge.slice(0, 3);
  const implementationSteps = work.solution.slice(0, 3);
  const afterSteps = work.operationAfter.slice(0, 3);
  const pageJsonLd={"@context":"https://schema.org","@graph":[{"@type":"CreativeWork",name:work.seoTitle,headline:work.title,url:canonicalUrl(`/works/${work.slug}`),description:work.summary,inLanguage:"ja-JP",keywords:work.categories.join(", ")},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ホーム",item:canonicalUrl("/")},{"@type":"ListItem",position:2,name:"開発実績",item:canonicalUrl("/works")},{"@type":"ListItem",position:3,name:work.seoTitle,item:canonicalUrl(`/works/${work.slug}`)}]}]};

  return (
    <SiteShell active="/works">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(pageJsonLd)}} />
      <article className="work-detail" id="page-body">
        <nav className="work-breadcrumb" aria-label="パンくず">
          <Link href="/">TOP</Link><span>/</span><Link href="/works">実績</Link><span>/</span><span>{work.seoTitle}</span>
        </nav>

        <header className="work-detail-hero">
          <div className="work-detail-hero-copy">
            <p className="works-kicker">{work.categories.join(" / ").toUpperCase()}</p>
            <h1>{work.title}</h1>
            <p className="work-detail-summary">{work.summary}</p>
            <dl className="work-detail-meta">
              <div><dt>対応領域</dt><dd>{work.categories.join("・")}</dd></div>
              <div><dt>使用技術</dt><dd>{work.technologies?.join("・")}</dd></div>
              <div><dt>対応範囲</dt><dd>{work.scope.join("・")}</dd></div>
            </dl>
          </div>
          <ProcessFlow work={work} large />
        </header>

        <div className="work-detail-body">
          <section className="work-detail-section">
            <div className="work-detail-heading"><span>01</span><p>CHALLENGE</p><h2>課題</h2></div>
            <DetailList items={work.challenge} />
          </section>

          <section className="work-detail-section">
            <div className="work-detail-heading"><span>02</span><p>IMPLEMENTATION</p><h2>対応したこと</h2></div>
            <DetailList items={work.solution} />
            {work.facts && <div className="work-detail-facts">{work.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>}
          </section>

          <section className="work-detail-section work-detail-system">
            <div className="work-detail-heading"><span>03</span><p>SYSTEM FLOW</p><h2>仕組み</h2></div>
            <ProcessFlow work={work} />
          </section>

          <section className="work-detail-section">
            <div className="work-detail-heading"><span>04</span><p>OPERATION</p><h2>導入後の運用</h2></div>
            <DetailList items={work.operationAfter} />
          </section>

          <section className="work-change-rail" aria-label="導入前後の変化">
            {[
              ["BEFORE", beforeSteps],
              ["IMPLEMENTATION", implementationSteps],
              ["AFTER", afterSteps],
            ].map(([label, steps]) => <div key={label as string}><small>{label as string}</small><ol>{(steps as string[]).map((step) => <li key={step}>{step}</li>)}</ol></div>)}
          </section>

          <section className="work-detail-section">
            <div className="work-detail-heading"><span>05</span><p>TECHNOLOGY</p><h2>使用技術</h2></div>
            <div className="work-detail-tech">{work.technologies?.map((tech) => <span key={tech}>{tech}</span>)}</div>
          </section>

          <section className="work-detail-section work-applications">
            <div className="work-detail-heading"><span>06</span><p>APPLICATIONS</p><h2>この仕組みを応用できる業務</h2></div>
            <div><p>以下は、この案件で作った処理構造を別の業務へ置き換える場合の応用例です。掲載実績そのものではありません。</p><ul>{work.applications.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </section>

          <p className="work-confidential">※ 守秘義務・プライバシー保護のため、企業名・固有データ・一部仕様を伏せています。</p>

          <section className="work-related">
            <div className="work-detail-heading"><p>OTHER WORKS</p><h2>他の実績を見る</h2></div>
            <div>{related.map((item) => <Link href={`/works/${item.slug}`} key={item.slug}><small>{item.categories.slice(0, 2).join(" / ")}</small><b>{item.title}</b><span aria-hidden="true">→</span></Link>)}</div>
          </section>
        </div>

        <section className="work-detail-cta">
          <div><p className="works-kicker">CONTACT</p><h2>同じシステムではなく、<br />今の業務に合う形で。</h2></div>
          <div><p>現在の作業や利用中のツールを確認し、必要な部分だけ整理して実装します。</p><Link href="/contact">相談する <span aria-hidden="true">→</span></Link></div>
        </section>
      </article>
    </SiteShell>
  );
}

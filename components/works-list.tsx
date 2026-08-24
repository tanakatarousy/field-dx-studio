"use client";

import { useState } from "react";
import Link from "next/link";
import { workCategories, works, type WorkCategory } from "@/data/works";

export function WorksList() {
  const [active, setActive] = useState<"すべて" | WorkCategory>("すべて");
  const visible = active === "すべて" ? works : works.filter((work) => work.categories.includes(active));

  return (
    <section className="works-index" id="works-list">
      <div className="works-section-head">
        <div><p className="works-kicker">CASES</p><h2>実績</h2></div>
        <p>技術ではなく、解決した業務からご覧いただけます。</p>
      </div>
      <div className="works-filters" aria-label="実績カテゴリ">
        {workCategories.map((category) => (
          <button
            type="button"
            key={category}
            className={active === category ? "is-active" : ""}
            aria-pressed={active === category}
            onClick={() => setActive(category)}
          >{category}</button>
        ))}
      </div>
      <div className="works-grid" aria-live="polite">
        {visible.map((work, index) => (
          <article className="work-card" key={work.slug} style={{ animationDelay: `${index * 55}ms` }}>
            <p className="work-categories">{work.categories.join(" / ")}</p>
            <h3>{work.title}</h3>
            <p className="work-summary">{work.summary}</p>
            <div className="work-contrast">
              <div><small>課題</small><p>{work.challenge[0]}</p></div>
              <span aria-hidden="true">↓</span>
              <div><small>対応</small><p>{work.solution[0]}</p></div>
            </div>
            <ol className="work-flow" aria-label={`${work.title}の処理の流れ`}>
              {work.flow.map((step) => <li key={step}>{step}</li>)}
            </ol>
            {work.facts && <div className="work-facts">{work.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>}
            {work.technologies && <div className="work-tech">{work.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>}
            <Link className="work-link" href={`/works/${work.slug}`}>事例を見る <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}

import { HeroFlowDemo } from "@/components/ui-demos";
import { ContactForm } from "@/components/contact-form";
import { SiteShell } from "@/components/site-shell";

export default function Home() {
  return (
    <SiteShell home>
      <section className="home-hero" id="page-body">
        <div className="home-hero-copy">
          <p className="eyebrow light"><span /> DX &amp; SYSTEM DEVELOPMENT</p>
          <h1>手作業を、<br /><em>仕組みに変える。</em></h1>
          <p>予約、問い合わせ、顧客情報、売上集計。紙・電話・Excel・複数サービスに分かれた業務を、今の運用に合わせて整理し、使いやすいWebシステムにします。</p>
          <div className="home-actions"><a className="button button-primary" href="#problems">自店に当てはまるか見る <span>↓</span></a><a className="home-text-link" href="#contact">相談する <span>→</span></a></div>
          <div className="home-tags"><span>業務システム開発</span><span>API・外部サービス連携</span><span>既存システム改善</span><span>Web・集客改善</span></div>
        </div>
        <HeroFlowDemo />
      </section>
      <section className="lp-problems" id="problems">
        <div className="lp-heading"><p>よくある課題</p><h2>こんな手間が、<br />積み重なっていませんか。</h2><span>飲食店をはじめ、地域の店舗や中小事業者からよく伺う内容です。</span></div>
        <div className="lp-problem-grid">{[
          ["予約が分散","電話、予約サイト、SNSの連絡を見比べて、空席を手作業で調整している。"],
          ["顧客情報が残らない","来店履歴や好みが担当者の記憶に頼り、再来店の案内に活かせない。"],
          ["転記と集計が多い","予約内容や売上をExcelへ入力し直し、毎日の締め作業に時間がかかる。"],
          ["Webから相談されない","サイトはあるものの、情報が古い、予約しづらい、効果を確認できない。"],
        ].map(([title,copy],index) => <article key={title}><small>0{index + 1}</small><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="lp-services" id="services">
        <div className="lp-heading"><p>導入できるもの</p><h2>必要な部分だけ、<br />今の業務につなぎます。</h2><span>全面的な入れ替えではなく、負担の大きい一工程から始められます。</span></div>
        <div className="lp-service-list">{[
          ["予約・受付をまとめる","Web予約、空席状況、問い合わせ、自動返信、前日通知を一つの流れにします。","予約確認の往復と対応漏れを減らす"],
          ["顧客・案件を管理する","顧客情報、来店・対応履歴、担当者、次にすることを一画面で確認できます。","記憶や個人のメモに頼らない"],
          ["集計・通知を自動化する","売上表への反映、日次集計、担当者通知、カレンダー登録を自動化します。","閉店後や月末の転記を減らす"],
          ["Webと集客を改善する","サービス案内、検索対策、アクセス計測、予約・問い合わせ導線を整えます。","ポータルサイトだけに頼らない入口を作る"],
        ].map(([title,copy,result],index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><strong>{result}</strong></article>)}</div>
      </section>
      <section className="lp-usecase" aria-label="飲食店への導入例">
        <div><p>飲食店への導入例</p><h2>Web予約から前日通知までを自動化</h2><span>電話予約はそのまま残し、Webから入った予約だけを先に自動化することもできます。</span></div>
        <ol>{["予約を受付","空席を確認","顧客台帳へ登録","確認メールを送信","前日に自動通知"].map((item,index) => <li key={item}><small>{index + 1}</small><b>{item}</b></li>)}</ol>
      </section>
      <section className="lp-approach" id="approach">
        <div className="lp-heading"><p>進め方</p><h2>仕様書がなくても、<br />小さく始められます。</h2></div>
        <div className="lp-step-grid">{[
          ["01","現状を確認","現在のサイト、予約方法、Excelなどを確認します。"],
          ["02","最小案を提示","最初に改善する一工程と、必要な画面を整理します。"],
          ["03","画面で確認","完成前に操作できる画面を見て、使い方を調整します。"],
          ["04","導入・改善","小さく運用を始め、必要に応じて連携や集計を追加します。"],
        ].map(([number,title,copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="lp-contact" id="contact">
        <div className="lp-contact-copy"><p className="eyebrow dark"><span /> CONTACT</p><h2>困っている作業を、<br />そのままお聞かせください。</h2><p>「予約管理が大変」「同じ情報を何度も入力している」など、要件が整理されていなくても構いません。対応できる範囲と、最初に着手する場所をご案内します。</p><ul><li>仕様書は不要です</li><li>全面刷新を前提にしません</li><li>対応が難しい部分も先にお伝えします</li></ul></div>
        <ContactForm />
      </section>
    </SiteShell>
  );
}

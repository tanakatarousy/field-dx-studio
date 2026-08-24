"use client";

import { useEffect, useState } from "react";

const flowDemos = [
  { id: "support", label: "受付・保守", title: "業務用冷蔵庫が冷えない", badge: "緊急", button: "受付から通知まで動かす", steps: [["23:41", "問い合わせ", "冷蔵庫が冷えない／店舗営業中"], ["23:41", "緊急度判定", "優先度：高・食品ロスの可能性"], ["23:42", "案件登録", "型番・写真・住所を案件票へ保存"], ["23:42", "担当者通知", "対応エリアの担当候補へ連絡"]] },
  { id: "booking", label: "予約管理", title: "初回カウンセリング予約", badge: "予約", button: "予約から通知まで動かす", steps: [["10:02", "Web予約", "希望日時とメニューを受付"], ["10:02", "空き確認", "担当者の予約枠を自動確認"], ["10:03", "顧客登録", "連絡先と来店履歴を台帳へ保存"], ["10:03", "自動通知", "予約確定と前日案内を設定"]] },
  { id: "case", label: "案件管理", title: "見積もりについて相談したい", badge: "新規", button: "問い合わせを案件化する", steps: [["14:18", "問い合わせ", "Webフォームから相談を受付"], ["14:18", "内容分類", "サービス種別と対応期限を整理"], ["14:19", "案件化", "顧客情報と対応履歴を登録"], ["14:19", "担当者割当", "担当者へ通知し状況管理を開始"]] },
] as const;

export function HeroFlowDemo() {
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(-1);
  const [demoIndex, setDemoIndex] = useState(0);
  const demo = flowDemos[demoIndex];
  useEffect(() => {
    if (!running) return;
    if (active >= demo.steps.length - 1) {
      const done = window.setTimeout(() => setRunning(false), 450);
      return () => window.clearTimeout(done);
    }
    const timer = window.setTimeout(() => setActive((value) => value + 1), active < 0 ? 260 : 580);
    return () => window.clearTimeout(timer);
  }, [active, running, demo.steps.length]);
  function run() { setActive(-1); setRunning(true); }
  function selectDemo(index: number) { setDemoIndex(index); setActive(-1); setRunning(false); }
  return (
    <div className="demo-window hero-demo">
      <div className="demo-window-bar"><span><i /> 動く業務デモ</span><b>{running ? "処理中" : active === demo.steps.length - 1 ? "完了" : "待機中"}</b></div>
      <div className="hero-demo-tabs" role="tablist" aria-label="業務デモを選ぶ">{flowDemos.map((item, index) => <button type="button" role="tab" aria-selected={demoIndex === index} className={demoIndex === index ? "is-selected" : ""} onClick={() => selectDemo(index)} key={item.id}>{item.label}</button>)}</div>
      <div className="demo-request"><small>{demo.label}</small><strong>{demo.title}</strong><em>{demo.badge}</em></div>
      <div className="demo-flow">{demo.steps.map(([time, label, detail], index) => <div className={index <= active ? "is-active" : ""} key={`${demo.id}-${label}`}><time>{time}</time><i /><span><strong>{label}</strong><small>{detail}</small></span></div>)}</div>
      <button className="hero-demo-run" type="button" onClick={run} disabled={running}>{running ? "処理を再現しています…" : demo.button}<span>▶</span></button>
      <p>入力項目、判定条件、保存先、通知先は実際の業務に合わせて設計します。</p>
    </div>
  );
}

export function IntakeDemo() {
  const [step, setStep] = useState(0);
  const labels = ["症状", "写真・型番", "連絡先", "受付完了"];
  return (
    <div className="demo-window service-demo">
      <div className="mini-app-head"><span>修理受付</span><b>入力 {step + 1} / 4</b></div>
      <div className="mini-progress">{labels.map((label, index) => <i className={index <= step ? "is-on" : ""} key={label}><span>{index + 1}</span><small>{label}</small></i>)}</div>
      <div className="intake-card">
        {step === 0 && <><small>現在の状況を教えてください</small><button className="chosen">まったく冷えない</button><button>冷えが弱い</button></>}
        {step === 1 && <><small>写真と型番</small><div className="upload-tile"><b>写真を追加済み</b><span>equipment_front.jpg</span></div></>}
        {step === 2 && <><small>訪問先と連絡先</small><div className="fake-input">東京都新宿区西新宿 1-2-3</div><div className="fake-input">090-0000-0000</div></>}
        {step === 3 && <div className="complete-state"><b>受付しました</b><p>受付番号 TK-0824<br />担当確認後にご連絡します。</p></div>}
      </div>
      <div className="demo-actions"><button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>戻る</button><button className="primary" onClick={() => setStep((step + 1) % 4)}>{step === 3 ? "最初から" : "次へ"}</button></div>
    </div>
  );
}

export function DispatchDemo() {
  const [selected, setSelected] = useState("冷蔵庫停止");
  const columns = [["新規", ["冷蔵庫停止", "給湯器エラー"]], ["手配中", ["製氷機エラー", "空調異音"]], ["訪問確定", ["冷凍庫点検", "換気扇交換"]]] as const;
  return (
    <div className="demo-window service-demo dispatch-demo">
      <div className="mini-app-head"><span>本日の案件</span><b>6件・優先1件</b></div>
      <div className="dispatch-board">{columns.map(([label, items]) => <div key={label}><small>{label} {items.length}</small>{items.map((item, index) => <button className={selected === item ? "is-selected" : ""} onClick={() => setSelected(item)} key={item}><b>{item}</b><span>{index === 0 && label === "新規" ? "優先度 高" : "通常"}</span><p>新宿区・10:{index}0受付</p></button>)}</div>)}</div>
      <div className="selection-note"><span>選択中</span><b>{selected}</b><small>担当候補と過去履歴を右画面へ表示</small></div>
    </div>
  );
}

export function FieldDemo() {
  const [checks, setChecks] = useState([true, false, false]);
  const tasks = ["電源・ブレーカー確認", "エラーコード確認", "温度センサー測定"];
  return (
    <div className="demo-window service-demo field-demo">
      <div className="field-phone"><div className="phone-status"><b>10:30 訪問</b><span>優先度 高</span></div><h3>業務用冷蔵庫が冷えない</h3><p>新宿区西新宿 1-2-3</p><div className="history-card"><small>前回の対応</small><b>2025/11 温度センサー交換</b></div>{tasks.map((task, index) => <button className="check-task" onClick={() => setChecks((current) => current.map((value, target) => target === index ? !value : value))} key={task}><i>{checks[index] ? "✓" : ""}</i><span>{task}</span></button>)}<button className="report-button">写真を追加して報告</button></div>
      <div className="field-side"><small>現場でできること</small><b>{checks.filter(Boolean).length} / 3 確認済み</b><p>住所、履歴、作業項目、写真、署名をスマートフォンにまとめます。</p></div>
    </div>
  );
}

export function MaintenanceDemo() {
  const [view, setView] = useState<"asset" | "notice">("asset");
  return (
    <div className="demo-window service-demo maintenance-demo">
      <div className="mini-app-head"><span>設備台帳</span><div><button className={view === "asset" ? "is-selected" : ""} onClick={() => setView("asset")}>設備</button><button className={view === "notice" ? "is-selected" : ""} onClick={() => setView("notice")}>通知</button></div></div>
      {view === "asset" ? <div className="asset-layout"><div className="asset-list"><button className="is-selected"><b>業務用冷蔵庫 A-01</b><span>最終点検 2026/04</span></button><button><b>製氷機 B-02</b><span>最終点検 2025/12</span></button><button><b>空調 C-03</b><span>最終点検 2026/02</span></button></div><div className="asset-detail"><small>保守履歴</small><h3>業務用冷蔵庫 A-01</h3><dl><div><dt>型番</dt><dd>RF-1200X</dd></div><div><dt>次回点検</dt><dd>2026/10/15</dd></div><div><dt>修理回数</dt><dd>3回</dd></div></dl><div className="asset-timeline"><i /><span><b>温度センサー交換</b><small>2025/11/04・山田</small></span></div></div></div> : <div className="notice-list"><article><span>7日後</span><div><b>定期点検のご案内</b><p>業務用冷蔵庫 A-01／顧客へ確認メール</p></div><em>送信予定</em></article><article><span>30日後</span><div><b>保守契約の更新</b><p>新宿店／担当営業へ通知</p></div><em>準備中</em></article></div>}
    </div>
  );
}

export function SeoDemo() {
  const [query, setQuery] = useState("業務用冷蔵庫 修理 東京");
  return <div className="demo-window insight-demo"><div className="mini-app-head"><span>検索ニーズ設計</span><b>Search intent</b></div><div className="query-list">{["業務用冷蔵庫 修理 東京", "製氷機 修理 24時間", "冷凍庫 冷えない 原因"].map((item, index) => <button className={query === item ? "is-selected" : ""} onClick={() => setQuery(item)} key={item}><span>0{index + 1}</span><b>{item}</b><em>{[74,52,41][index]}</em></button>)}</div><div className="query-result"><small>この検索に必要なページ</small><h3>{query}</h3><div><span>症状別の説明</span><span>対応地域</span><span>料金の目安</span><span>相談導線</span></div><p>検索語を記事数ではなく、相談前に必要な情報へ変換します。</p></div></div>;
}

export function AnalyticsDemo() {
  const [period, setPeriod] = useState("7日");
  const bars = period === "7日" ? [34,48,42,66,54,83,72] : [28,32,44,38,57,52,68,61,74,82,70,88];
  return <div className="demo-window insight-demo"><div className="mini-app-head"><span>アクセスと問い合わせ</span><div><button className={period === "7日" ? "is-selected" : ""} onClick={() => setPeriod("7日")}>7日</button><button className={period === "30日" ? "is-selected" : ""} onClick={() => setPeriod("30日")}>30日</button></div></div><div className="metric-row"><article><small>訪問者</small><b>{period === "7日" ? "186" : "742"}</b><span>重複なし</span></article><article><small>相談開始</small><b>{period === "7日" ? "24" : "91"}</b><span>12.9%</span></article><article><small>相談完了</small><b>{period === "7日" ? "11" : "38"}</b><span>45.8%</span></article></div><div className="analytics-chart">{bars.map((height, index) => <i style={{height: `${height}%`}} key={index} />)}</div><div className="funnel-line"><span>検索・SNS</span><i /><span>サービス</span><i /><span>相談開始</span><i /><span>送信</span></div></div>;
}

export function JourneyDemo() {
  const [active, setActive] = useState(0);
  const stages = [["見つける","検索結果から地域別ページへ"],["理解する","対応範囲・料金・流れを確認"],["相談する","症状に合う質問だけを表示"],["続ける","点検時期に適切な案内"]];
  return <div className="demo-window insight-demo journey-demo"><div className="mini-app-head"><span>顧客導線</span><b>End user journey</b></div><div className="journey-rail">{stages.map(([title], index) => <button className={active === index ? "is-selected" : ""} onClick={() => setActive(index)} key={title}><i>{index + 1}</i><span>{title}</span></button>)}</div><div className="journey-detail"><small>STEP {active + 1}</small><h3>{stages[active][0]}</h3><p>{stages[active][1]}</p><div className="journey-screen"><span /><span /><b>{["地域と症状から探す","対応可否が3秒で分かる","入力は必要な項目だけ","次回点検を忘れない"][active]}</b></div></div></div>;
}

export function ApproachDemo() {
  const [step, setStep] = useState(0);
  const steps = [["現状確認","問い合わせから完了までを図にする"],["試作","実データを使わない専用デモで確認"],["小規模導入","1業務・1拠点で並行運用"],["運用・拡張","利用状況から連携範囲を広げる"]];
  return <div className="demo-window approach-demo"><div className="approach-stepper">{steps.map(([title], index) => <button className={step === index ? "is-selected" : index < step ? "is-done" : ""} onClick={() => setStep(index)} key={title}><i>{index < step ? "✓" : `0${index + 1}`}</i><span>{title}</span></button>)}</div><div className="approach-stage"><small>PROJECT STEP / 0{step + 1}</small><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p><div className="deliverable-card"><span>この段階で確認するもの</span><b>{["業務フロー・困りごとの位置","画面・入力項目・通知先","利用者・対象拠点・戻し方","利用率・対応時間・次の改善"][step]}</b></div><button onClick={() => setStep((step + 1) % steps.length)}>{step === 3 ? "最初に戻る" : "次の段階を見る"} <span>→</span></button></div></div>;
}

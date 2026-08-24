export type WorkCategory =
  | "業務自動化"
  | "データ収集"
  | "API・外部連携"
  | "通知・監視"
  | "Webシステム"
  | "既存システム改修";

export type Work = {
  slug: string;
  title: string;
  summary: string;
  categories: WorkCategory[];
  challenge: string[];
  solution: string[];
  result?: string[];
  technologies?: string[];
  flow: string[];
  facts?: string[];
  operationAfter: string[];
  applications: string[];
  scope: string[];
  seoTitle: string;
};

export const workCategories: Array<"すべて" | WorkCategory> = [
  "すべて",
  "業務自動化",
  "データ収集",
  "API・外部連携",
  "通知・監視",
  "Webシステム",
  "既存システム改修",
];

export const works: Work[] = [
  {
    slug: "music-data-automation",
    title: "複数サイトの情報収集を、自動実行できる仕組みに。",
    summary: "複数のWebサイトから音楽関連情報を定期取得し、必要な情報を自動で整理・集計するシステムを構築しました。",
    categories: ["データ収集", "業務自動化"],
    challenge: ["複数サイトの情報を継続的に確認し、必要な項目をまとめる作業が必要だった"],
    solution: ["情報取得・整理・集計を定期実行", "並列処理を含む運用を設計", "納品後にVPS環境へ移行し、運用を改善"],
    result: ["3時間ごと、1日8回の自動実行", "最大10並列で処理する運用へ変更"],
    technologies: ["Python", "定期実行", "VPS"],
    flow: ["取得", "整理", "集計", "保存"],
    facts: ["1日8回", "最大10並列", "VPS移行"],
    operationAfter: ["3時間ごと、1日8回の定期実行で情報を取得・集計", "最大10並列で処理", "VPS環境へ移行し、納品後も運用を改善"],
    applications: ["競合情報の定期収集", "商品情報の集計", "掲載情報の更新確認", "複数媒体のデータ統合", "定期レポート作成"],
    scope: ["調査", "設計", "実装", "定期実行", "VPS移行", "運用改善"],
    seoTitle: "音楽情報の自動収集・集計システム",
  },
  {
    slug: "tennis-availability-alert",
    title: "空き状況の確認を、条件一致時だけ届く通知に。",
    summary: "テニス施設の空き・キャンセルを定期的に確認し、希望条件に合う場合だけ通知する仕組みを構築しました。",
    categories: ["通知・監視", "業務自動化"],
    challenge: ["空き状況を人が繰り返し確認", "空きが出ても気付けない場合があった"],
    solution: ["対象情報を定期確認", "条件判定と重複確認の後に通知"],
    result: ["条件一致時だけ確認すればよい運用へ変更", "常時確認する作業を減らした"],
    technologies: ["定期実行", "条件判定", "通知"],
    flow: ["定期確認", "条件判定", "重複確認", "通知"],
    operationAfter: ["常時ページを見るのではなく、対象が見つかった場合に確認する運用へ変更", "通知を受けた後の予約・判断は利用者が実施"],
    applications: ["空き枠監視", "在庫監視", "価格変更監視", "求人掲載監視", "新着情報監視", "キャンセル枠通知"],
    scope: ["対象確認", "条件判定", "重複除外", "通知", "運用調整"],
    seoTitle: "テニス施設の空き・キャンセル通知システム",
  },
  {
    slug: "line-business-tool",
    title: "LINEを入口に、必要な情報を処理・通知する仕組みを構築。",
    summary: "LINEを利用する既存業務に合わせ、情報の受付・処理・通知を行う業務機能を開発、カスタマイズしました。",
    categories: ["API・外部連携", "Webシステム", "業務自動化"],
    challenge: ["普段使うLINEと業務処理が分かれていた"],
    solution: ["LINEを入口に情報を受け付ける機能を構築", "Webhookを介して処理・通知を連携"],
    technologies: ["LINE Messaging API", "LIFF", "Webhook"],
    flow: ["LINE", "受付", "処理", "通知"],
    operationAfter: ["利用者は普段使うLINEから情報を送信", "受け付けた情報をWebhook経由で処理し、必要な通知を返す運用へ変更"],
    applications: ["問い合わせ受付", "予約内容の受付", "社内申請", "担当者への通知", "顧客向け案内", "入力内容の確認"],
    scope: ["要件確認", "設計", "API連携", "実装", "テスト", "カスタマイズ"],
    seoTitle: "LINEを利用した業務ツール",
  },
  {
    slug: "google-calendar-slack",
    title: "予定の変更を、Slackへ自動で届ける。",
    summary: "Google Calendarの予定情報を取得し、必要な情報をSlackへ通知する連携機能を構築しました。",
    categories: ["API・外部連携", "通知・監視", "業務自動化"],
    challenge: ["予定確認と共有を手動で行う必要があった"],
    solution: ["Calendarの予定情報を取得", "必要な情報を判定しSlackへ通知"],
    technologies: ["Google Calendar API", "Slack API"],
    flow: ["Google Calendar", "判定", "Slack"],
    operationAfter: ["Google Calendarの予定情報を仕組み側で取得", "必要な情報だけをSlackで確認できる運用へ変更"],
    applications: ["予定変更通知", "予約通知", "担当者割当", "会議前リマインド", "営業予定共有", "現場スケジュール共有"],
    scope: ["要件確認", "API連携", "判定処理", "通知", "テスト"],
    seoTitle: "Google CalendarとSlackの自動連携",
  },
  {
    slug: "web-data-collection",
    title: "人が巡回していたWeb確認を、自動収集へ。",
    summary: "Webサイトから必要な項目だけを取得し、重複を除いて利用しやすい形式へ出力する仕組みを複数開発しました。",
    categories: ["データ収集", "業務自動化"],
    challenge: ["複数ページを人が巡回し、必要項目を転記していた"],
    solution: ["必要項目を自動取得", "データを整形し重複を除外", "CSV・Spreadsheet・DBへ出力"],
    technologies: ["Python", "Selenium", "Playwright"],
    flow: ["Webサイト", "必要項目取得", "整形・重複除外", "出力"],
    operationAfter: ["対象ページの巡回と必要項目の抽出を自動処理", "整理済みのデータをCSV・Spreadsheet・DBなどで確認・利用する運用へ変更"],
    applications: ["店舗情報収集", "商品情報収集", "価格・在庫確認", "公開情報の一覧化", "更新差分の確認", "営業候補データの整理"],
    scope: ["対象調査", "取得設計", "実装", "データ整形", "出力", "運用調整"],
    seoTitle: "Webデータ収集・スクレイピング",
  },
  {
    slug: "gas-automation",
    title: "スプレッドシート上の手作業を、自動処理へ。",
    summary: "Google Spreadsheetを中心とした転記・集計・データ整理・定期実行・通知などの処理を自動化しました。",
    categories: ["業務自動化", "API・外部連携", "既存システム改修"],
    challenge: ["表への転記や集計を繰り返し手作業で行っていた"],
    solution: ["既存のSpreadsheetを活かして処理を自動化", "定期実行と通知を業務に合わせて設定"],
    technologies: ["Google Apps Script", "Google Spreadsheet"],
    flow: ["入力", "転記・整理", "集計", "通知"],
    operationAfter: ["既存のSpreadsheetを入口として継続利用", "転記・集計・データ整理・定期実行・通知を仕組み側で処理する運用へ変更"],
    applications: ["CSV転記", "日報集計", "請求情報整理", "フォーム受付", "メール通知", "定期レポート"],
    scope: ["現状確認", "設計", "GAS実装", "定期実行", "通知", "運用調整"],
    seoTitle: "Google Apps Scriptによる業務自動化",
  },
];

export function getWork(slug: string) {
  return works.find((work) => work.slug === slug);
}

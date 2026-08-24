# つなぐ開発 — 現場DX設計室

ChatGPT Sitesで稼働している公開サイトのCloudflare Workers移行用リポジトリです。元のChatGPT Siteとは独立しており、元サイトを削除・上書きしません。

## Cloudflare構成

- Workers: Vinextの公開ページ、問い合わせ、管理API
- D1 binding `DB`: 問い合わせと運用データ
- Static assets: Worker Assets

## Build / Deploy

1. `.env.example`を参考にPreview/Productionの環境変数を分離する
2. `npm ci`
3. `npm run build`
4. `npm run db:migrate:remote`
5. `npm run deploy:cloudflare`

初回公開前は`NEXT_PUBLIC_SEO_INDEXABLE=false`、検収後に新URLをcanonicalへ設定して`true`へ切り替えます。秘密値はCloudflare Secretsへ登録してください。

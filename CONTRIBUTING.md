# Contributing to TaskFlow

## 開発環境

- Node.js 20+
- npm

## セットアップ

```bash
git clone <repo-url>
cd taskflow
cp .env.example .env
# .env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定
npm install
```

## 開発サーバー

```bash
npm run dev
```

## テスト

```bash
# 単体テスト（watch なし）
npm run test:run

# カバレッジ
npm run test:coverage

# E2E（Playwright）
npm run test:e2e
```

## ビルド

```bash
npm run build
```

## コミット

- Conventional Commits を推奨: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- 英語でメッセージを書く

## プルリクエスト

1. `main` または `develop` からブランチを切る
2. 変更後、ローカルで `npm run test:run` と `npm run build` が通ることを確認
3. PR 作成。CI（lint / test / build）が通ればレビュー依頼

## 規約

- 1 ファイル 200 行以下
- 1 コンポーネント = 1 ファイル
- 新規 API やコンポーネントにはテストを追加する

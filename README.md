# TaskFlow

タスク・プロジェクト・クライアントを一括管理する Web アプリ。カンバン・ガントチャート・ダッシュボード対応。

## 技術スタック

- **フロント**: React 18, Vite 5
- **バックエンド / Auth**: Supabase (PostgreSQL, Auth, Row Level Security)
- **UI**: CSS（BEM 風）、ダークモード対応
- **D&D**: @dnd-kit（カンバン・プロジェクト並び替え）
- **テスト**: Vitest, Testing Library

## セットアップ

### 1. リポジトリのクローンと依存関係

```bash
git clone <repo-url>
cd taskflow
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env` を作成し、Supabase の値を設定する。

```bash
cp .env.example .env
```

`.env` に以下を設定（Supabase Dashboard → Project Settings → API で取得）:

- `VITE_SUPABASE_URL` … プロジェクト URL
- `VITE_SUPABASE_ANON_KEY` … anon (public) key

### 3. Supabase 側の準備

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. **Authentication** で Email ログインを有効化（必要に応じてリダイレクト URL を設定。`docs/SUPABASE_AUTH_REDIRECT.md` 参照）
3. **SQL Editor** で以下を**順に**実行:
   - テーブル作成: `docs/` 内の各 `SUPABASE_*.sql`（プロジェクト・タスク・テンプレート・カテゴリ・ユーザー・クライアント・覚えておくこと など）
   - 所有者用カラム: `docs/SUPABASE_OWNER_LINK.sql`
   - **RLS（必須）**: `docs/SUPABASE_RLS_POLICIES.sql`  
     → 未実行のままでは他ユーザーのデータが読み書き可能になるため、本番では必ず実行すること

### 4. 開発サーバー起動

```bash
npm run dev
```

ビルド・テスト:

```bash
npm run build
npm run test
npm run test:run
```

## 主な機能

- プロジェクト・タスクの CRUD、並び替え
- カンバン（D&D）、ガントチャート、ダッシュボード
- クライアント・「覚えておくこと」メモ
- テンプレート・カテゴリ
- Supabase Auth によるログイン／ログアウト

## ドキュメント

- `docs/OWNER_LINK_GUIDE.md` … ログインとデータ紐づけの流れ
- `docs/SUPABASE_AUTH_REDIRECT.md` … 認証リダイレクト設定
- `docs/CODE_REVIEW.md` … コードレビューと改善ロードマップ

## ライセンス

MIT（`LICENSE` を参照）

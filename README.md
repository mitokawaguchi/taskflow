# TaskFlow

タスク・プロジェクト・クライアントを一元管理する Web アプリ。カンバン・ガントチャート・ダッシュボードを備え、Supabase で認証・データ永続化を行います。

> **⚠️ 本番環境では必ず RLS（Row Level Security）を有効にしてください。**  
> RLS を設定しないと、anon key で他ユーザーのデータの参照・改ざん・削除が可能になります。  
> 手順は [docs/SUPABASE_RLS_SETUP.md](docs/SUPABASE_RLS_SETUP.md) と `docs/SUPABASE_RLS_POLICIES.sql` を参照してください。

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロント | React 18, Vite 5 |
| UI | カスタム CSS（ダークモード対応）、レスポンシブ |
| バックエンド | Supabase（Auth, PostgreSQL） |
| テスト | Vitest, Testing Library |

## プロジェクト構成（抜粋）

```
taskflow/
├── src/
│   ├── App.jsx          # メインアプリ・ルート
│   ├── api/             # Supabase 呼び出し・owner_id フィルタ（TypeScript モジュール）
│   ├── TaskForm.jsx      # タスク作成・編集
│   ├── KanbanBoard.jsx   # カンバン（DnD）
│   ├── GanttChart.jsx    # ガント
│   ├── Dashboard.jsx    # ダッシュボード
│   └── ...
├── docs/
│   ├── SUPABASE_RLS_SETUP.md   # RLS 実行手順
│   └── SUPABASE_RLS_POLICIES.sql
├── .env.example
└── package.json
```

## セットアップ

### 1. クローンと依存関係

```bash
git clone <repo-url>
cd taskflow
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env` を作成し、Supabase の値を設定します。

```bash
cp .env.example .env
```

| 変数 | 必須 | 説明 |
|------|------|------|
| `VITE_SUPABASE_URL` | ✅ | Supabase プロジェクト URL（Settings → API） |
| `VITE_SUPABASE_ANON_KEY` | ✅ | 匿名（anon）キー。RLS 有効化必須 |

本番（Vercel 等）ではダッシュボードの環境変数に同じキーを設定してください。

### 3. Supabase 側の準備

1. [Supabase](https://app.supabase.com) でプロジェクトを作成
2. **SQL Editor** で `docs/` 内のスキーマ・RLS 用 SQL を実行
3. 手順は **`docs/SUPABASE_RLS_SETUP.md`** を参照（RLS 未設定だと他ユーザーデータが参照・改ざん可能）

### 4. 起動

```bash
npm run dev
```

表示された URL（例: http://localhost:5173）にアクセスします。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run preview` | ビルドのプレビュー |
| `npm run test` | テスト（watch） |
| `npm run test:run` | テスト 1 回実行 |
| `npm run test:coverage` | カバレッジ付きテスト |

## トラブルシューティング

- **「Supabase の設定がありません」**  
  `.env` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` が設定されているか確認。Vite は先頭が `VITE_` の変数のみクライアントに渡します。

- **タスク・プロジェクトが保存できない / 弾かれる**  
  - ログイン状態か確認。  
  - Supabase で RLS を有効にしている場合、`docs/SUPABASE_RLS_POLICIES.sql` を実行済みか確認。  
  - ブラウザの開発者ツール → Network で API のレスポンス（403/500 とメッセージ）を確認。

- **ビルドエラー**  
  `npm run build` を実行し、表示されるエラーに従って依存関係や Node バージョンを確認。

## Contributing

1. 機能追加・修正はブランチを切って作業
2. `npm run test:run` でテスト通過を確認
3. 型・テスト・セキュリティ（RLS・環境変数）を意識した変更を推奨（詳細は CONTRIBUTING.md）

## ライセンス

MIT — 詳細は [LICENSE](LICENSE) を参照してください。

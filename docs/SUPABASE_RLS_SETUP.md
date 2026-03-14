npm run test:run# RLS（Row Level Security）の設定と検証

本番・チーム利用時は **必ず RLS を有効にしてください**。未設定のままでは anon key で他ユーザーのデータの読み書きが可能になります。

## 前提

1. 全テーブル（`tf_projects`, `tf_tasks`, `tf_templates`, `tf_categories`, `tf_users`, `tf_clients`, `tf_remember`）が作成済みであること  
2. **`docs/SUPABASE_OWNER_LINK.sql` を実行済み**であること（各テーブルに `owner_id` が存在すること）

## 実行手順（推奨）

1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを開く  
2. 左メニュー **SQL Editor** を開く  
3. **New query** で新規クエリを作成  
4. `docs/SUPABASE_RLS_POLICIES.sql` の内容を**全文コピー＆ペースト**  
5. **Run**（または Ctrl+Enter）で実行  
6. エラーが出ないことを確認（「Success. No rows returned」で問題なし）

## 検証（RLS が有効か確認する）

### 1. ポリシー一覧の確認

SQL Editor で次を実行し、7 テーブル分のポリシーが表示されることを確認する。

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename LIKE 'tf_%'
ORDER BY tablename, policyname;
```

期待: 各テーブルに `_select`, `_insert`, `_update`, `_delete` の 4 ポリシーずつ、計 28 本程度。

### 2. 動作確認の考え方

- **ログインした状態**でアプリを使い、プロジェクト・タスクの作成・編集・削除ができること  
- **別ユーザー**（別メールでサインアップしたアカウント）でログインすると、先のユーザーのデータは見えない・編集できないこと  
- 未ログイン（anon）では、`auth.uid()` が NULL のため、`owner_id IS NULL` の行だけ見える設計。ログイン必須にしている場合はアプリ側でリダイレクトしていれば問題ない

### 3. RLS が無効な場合の挙動

RLS を実行していないと、DevTools の Network から Supabase の URL と anon key を取得し、`curl` や Postman で `GET /rest/v1/tf_tasks?select=*` を叩くと **全ユーザーのタスク** が返ります。RLS 実行後は、JWT なしまたは別ユーザーの JWT では他人の行は返りません。

## トラブルシューティング

| 現象 | 対処 |
|------|------|
| `column "owner_id" does not exist` | 先に `docs/SUPABASE_OWNER_LINK.sql` を実行する |
| `relation "tf_xxx" does not exist` | 該当テーブル用の `docs/SUPABASE_*.sql` を先に実行する |
| ログイン後にデータが一件も出ない | 既存行の `owner_id` が NULL のままの可能性。アプリの「データをアカウントに紐づけ」で紐づけるか、SQL で `UPDATE tf_projects SET owner_id = '自分のauth.uid()' WHERE ...` で設定する（紐づけ機能は廃止推奨のため、新規はログイン後に作成すれば自動で owner_id が入る） |

## 本番リリース前チェックリスト

- [ ] 上記「実行手順」で `SUPABASE_RLS_POLICIES.sql` を本番プロジェクトで実行済み
- [ ] 「検証」の SQL でポリシー一覧が期待どおりであることを確認済み
- [ ] 別アカウントでログインし、他ユーザーのデータが見えないことを手動確認済み

## 参考

- ポリシー定義: `docs/SUPABASE_RLS_POLICIES.sql`  
- コードレビューでの RLS 要件: `docs/CODE_REVIEW.md` の SEC-001

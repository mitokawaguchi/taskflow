# Gmail 複数アカウント連携 — 設計（ドラフト）

TaskFlow ユーザーが **複数の Gmail を未返信一覧に紐づける**ための設計。実装は未着手。Chatwork は対象外（現行の Edge Secrets 方式のまま）。

---

## 1. ゴール / 非ゴール

| ゴール | 非ゴール（今回やらない） |
|--------|-------------------------|
| 同一 TaskFlow ユーザーが Gmail を複数連携 | Chatwork の複数アカウント |
| 連携は OAuth（refresh_token をサーバー側で保管） | メール送信・下書き・ラベル操作 |
| 未返信一覧に **アカウント表示** と **マージまたはフィルタ** | 全メール全文検索 |

---

## 2. 現状との差分

| 項目 | 現状 | 複数対応後 |
|------|------|------------|
| トークン | ブラウザ `sessionStorage` に短期 access_token を1本 | **DB + Edge** に refresh_token（アカウントごと） |
| OAuth | 同意画面リンクのみ（code 交換なし） | Edge が `code`→token、**`prompt=consent` で初回 refresh 取得** |
| 一覧 | 単一クエリ結果 | アカウントごとに fetch → **マージ**または **アカウント別タブ** |
| Gmail リンク | `.../mail/u/0/#inbox/...` 固定 | **`authuser=` またはメールアドレス**で開き先を区別 |

---

## 3. データモデル（案）

**テーブル** `tf_gmail_accounts`（名前は migration で確定）

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | uuid | PK |
| `owner_id` | uuid | `auth.uid()` — RLS の主キー |
| `google_sub` | text | Google アカウント固有 ID（重複防止・表示用にユニーク `(owner_id, google_sub)`） |
| `email` | text | 表示用（プロフィール API で取得可） |
| `refresh_token_enc` | text | **暗号化済み** refresh_token（または Supabase Vault / Edge Secrets 参照） |
| `token_expires_at` | timestamptz | access 再発行の目安（任意） |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

- **RLS**: `SELECT/INSERT/UPDATE/DELETE` すべて `owner_id = auth.uid()`（既存規約どおり）。
- **CHECK**: `google_sub` 非空など。

refresh_token は **平文でクライアントに渡さない**。書き込みは **Edge Function のみ**（`service_role`）でもよいが、**ユーザー本人の行だけ**書けるよう RPC + `auth.uid()` 検証でも可。

---

## 4. OAuth / トークンライフサイクル

1. フロント「Gmail を追加」→ `redirect` を Edge または Supabase Auth のカスタム URL にし、**state** に TaskFlow の `session` と CSRF トークンを含める。
2. **Edge `gmail-oauth-callback`**（仮称）が `code` を受け取り、`client_secret` で token 応答を取得。
3. `refresh_token` を暗号化して `tf_gmail_accounts` に upsert（同一 `google_sub` は更新）。
4. **一覧取得**は別 Edge `gmail-list-unreplied`（仮称）が:
   - JWT でユーザーを検証
   - `owner_id` に紐づく全アカウントの refresh から **access_token を都度取得**（またはキャッシュ）
   - 既存 `fetchInboxMessageSummaries` と同様の **Gmail API クエリ**をアカウントごとに実行
   - レスポンスに **`accountEmail` / `accountId`** を付与して返す

**refresh 失敗時**: 該当アカウント行を「要再連携」フラグにし、UI で再 OAuth を促す。

---

## 5. API クォータ・負荷

- アカウント数 × ポーリング × `list` + `get` 呼び出し。**5分ポーリングはアカウント数に比例**して増える。
- 対策案: ポーリング間隔を延ばす、**手動更新メイン**、アカウントごと **直列 + バックオフ**、1 日あたり上限の表示。

---

## 6. UI（案）

- **連携済み Gmail** 一覧（メールアドレス・削除（連携解除））。
- **「別の Gmail を追加」** → OAuth。
- 未返信テーブルに **「アカウント」列**（またはバッジ）。
- フィルタ: 「すべての Gmail / アカウントAのみ」。
- Chatwork タブは現状どおり（変更なし）。

---

## 7. 移行

- 既存の `sessionStorage` 単一トークンは **レガシー**として残すか、**一度だけ**「このトークンをアカウント1として DB に移す」ウィザードはコストが高いので、**複数対応リリース時は OAuth し直し**でよいと明記。

---

## 8. 実装フェーズ（提案）

1. Migration + RLS + `tf_gmail_accounts` の CRUD（サーバー経由のみ）。
2. Edge: OAuth callback + refresh で access 取得。
3. Edge: 未返信一覧集約 API。
4. フロント: 連携 UI・一覧のマージ・レガシー sessionStorage の撤去または非推奨表示。

---

## 9. 関連ドキュメント

- [GMAIL_SETUP.md](./GMAIL_SETUP.md) — 単一 OAuth クライアント前提の手順（複数対応後は Edge URL をリダイレクトに追加）。
- [MAIL_TRACKER_QUICKSTART.md](./MAIL_TRACKER_QUICKSTART.md)

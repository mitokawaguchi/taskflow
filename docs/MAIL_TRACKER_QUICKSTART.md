# 未返信（メール・Chatwork）クイックスタート

## 何を設定すればよいか（チェックリスト）

### Gmail（未返信メール）

| 設定場所 | 内容 |
|----------|------|
| Google Cloud | プロジェクト作成 → **Gmail API を有効化** |
| OAuth 同意画面 | スコープ `https://www.googleapis.com/auth/gmail.readonly` |
| OAuth クライアント（Web） | **承認済みリダイレクト URI** に、ローカルなら `http://localhost:5173/mail-tracker`、本番なら例: `https://taskflow-alpha-ebon.vercel.app/mail-tracker`（ホスト名の読み方は [GMAIL_SETUP.md](./GMAIL_SETUP.md) 冒頭の表） |
| `.env` | `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_REDIRECT_URI`（URI は Console と **完全一致**） |
| 画面 | **開発用**: 短期アクセストークンを「Gmail アクセストークン」欄に貼る（または同意画面から取得） |

詳細は [GMAIL_SETUP.md](./GMAIL_SETUP.md)。

### Chatwork（未返信 To メンション）

| 設定場所 | 内容 |
|----------|------|
| Supabase CLI | `supabase functions deploy fetch-chatwork-unread`（Dashboard からも可） |
| Secrets（同関数） | `CHATWORK_API_TOKEN`（API トークン） |
| Secrets | `CHATWORK_MY_ACCOUNT_ID`（**自分の**アカウント ID。`[To:自分]` の判定に使用） |
| アプリ | **TaskFlow にログイン済み**であること（JWT で Edge を呼ぶ） |

API トークンは **ブラウザに載せず** Edge の Secrets のみに置く。

## よくあるつまずき

- **Chatwork が空**: `CHATWORK_MY_ACCOUNT_ID` が違う / 関数未デプロイ / 未ログイン。
- **Gmail が空**: `.env` のリダイレクト URI と Google Console が一致していない / トークン期限切れ。
- **To メンションが拾われない**: Chatwork 上で `[To:アカウントID]` 形式の宛先が付いているメッセージのみ対象。

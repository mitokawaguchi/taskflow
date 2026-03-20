# Gmail API（未返信メールトラッカー）セットアップ

> まず全体のチェックリストは [MAIL_TRACKER_QUICKSTART.md](./MAIL_TRACKER_QUICKSTART.md) を参照。

## 1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) にログイン。
2. 上部のプロジェクト選択 → **新しいプロジェクト**（名前は任意、例: `taskflow-local`）。
3. 左メニュー **API とサービス** → **ライブラリ** → 「Gmail API」を検索 → **有効にする**。

## 2. OAuth 同意画面

1. **API とサービス** → **OAuth 同意画面**。
2. User Type は **外部**（個人の Gmail なら通常これ）。
3. アプリ名・ユーザーサポートメール・デベロッパーの連絡先を入力して保存。
4. **スコープを追加** → 手動で `https://www.googleapis.com/auth/gmail.readonly` を追加（または「Gmail API」の readonly を選択）。

## 3. OAuth 2.0 クライアント ID

1. **API とサービス** → **認証情報** → **認証情報を作成** → **OAuth クライアント ID**。
2. アプリケーションの種類: **ウェブアプリケーション**。
3. **承認済みのリダイレクト URI** に、本アプリの URL を追加。例:
   - ローカル: `http://localhost:5173/mail-tracker`
   - 本番: `https://＜Vercel のドメイン＞/mail-tracker`
4. 作成後、**クライアント ID** をコピー → `.env` の `VITE_GOOGLE_CLIENT_ID` に設定。
5. **クライアント シークレット**はブラウザだけの SPA では安全に使えないため、**code を token に交換する処理は Supabase Edge Function** などサーバー側に置くことを推奨。

## 4. TaskFlow 側の環境変数

`.env.example` を参照し、少なくとも次を設定:

- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_REDIRECT_URI`（上記と完全一致）

## 5. 本番運用で推奨される流れ

1. ユーザーが「Google で認証」をクリック → Google が `?code=` 付きでリダイレクト。
2. **Edge Function** が `code` + `client_secret` でトークンを取得し、**Supabase のテーブル（RLS 付き）**に refresh_token を保存。
3. フロントは **短期 access_token のみ** をメモリまたは短命キャッシュで保持。

現在の実装は **開発向け**に、短期アクセストークンを画面に貼り付け可能にしてあります。本番前に必ず差し替えてください。

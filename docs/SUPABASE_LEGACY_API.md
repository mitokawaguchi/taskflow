# 「レガシーAPIが使えない」と出たときの対処

Supabase が従来の **anon キー**（JWT 形式）を廃止し、新形式の **Publishable キー**（`sb_publishable_...`）に移行しています。アプリ内で「レガシーAPIが使えない」と出たら、次の手順でキーを差し替えてください。

---

## 手順（5分で完了）

### 1. Supabase で新しいキーを取得

1. [Supabase ダッシュボード](https://supabase.com/dashboard) にログインする。
2. 対象の **プロジェクト** を開く。
3. 左メニュー **「Project Settings」**（歯車）→ **「API」** または **「API Keys」** を開く。
4. **「API Keys」** タブ（Legacy API Keys ではない方）を開く。
5. **Publishable key** が無い場合は **「Create new API keys」** で作成する。
6. **Publishable key**（`sb_publishable_xxxxxxxxx` のように始まる長い文字列）を **コピー** する。  
   ※ 従来の「anon public」ではなく、**Publishable** の値を使う。

### 2. ローカルの .env を更新

プロジェクト直下の `.env` を開き、次のように **1行だけ** 書き換える。

- **変更前（例）**  
  `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...`（JWT 形式の長い文字列）
- **変更後**  
  `VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxx`（さきほどコピーした Publishable key を貼る）

`VITE_SUPABASE_URL` はそのままでよい。

### 3. Vercel の環境変数を更新（デプロイしている場合）

- **方法A（コマンド）**  
  `.env` を更新したあと、`npm run vercel:env-push` を実行してから Vercel で再デプロイする。
- **方法B（手動）**  
  Vercel → プロジェクト → **Settings** → **Environment Variables** → `VITE_SUPABASE_ANON_KEY` の **Value** を、新しい Publishable key に書き換えて **Save**。その後 **Deployments** から **Redeploy** する。

### 4. 動作確認

- ローカル: `npm run dev` で起動し、アプリがエラーなくデータを表示するか確認する。
- 本番: 再デプロイ後にサイトを開き、「レガシーAPIが使えない」が出ないか確認する。

---

## まとめ

| 項目 | 内容 |
|------|------|
| 原因 | 従来の anon キー（レガシー）が使えなくなっているため。 |
| 対処 | Supabase の **Publishable key** を取得し、`VITE_SUPABASE_ANON_KEY` をその値に差し替える。 |
| 差し替え場所 | ローカル `.env` と、デプロイしている場合は Vercel の Environment Variables。 |

アプリ側のコード（`createClient` の呼び方）は変えなくてよいです。キーだけ新形式にすれば動きます。

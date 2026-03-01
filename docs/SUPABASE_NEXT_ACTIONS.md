# TaskFlow を Supabase につなぐ手順（初心者向け）

**前提**: すでに別のプロジェクト用で Supabase にテーブルをたくさん作ってある。  
**やること**: その**同じ Supabase プロジェクト**に、TaskFlow 用のテーブルを**3つだけ新しく足す**。既存のテーブルは触らない。

---

## このアプリで使うデータは3種類だけ

| 何を保存する？     | テーブル名（新規で作る） |
|--------------------|--------------------------|
| プロジェクト一覧   | `tf_projects`            |
| タスク一覧         | `tf_tasks`               |
| テンプレート一覧   | `tf_templates`           |

名前の先頭に `tf_` を付けておくと、「TaskFlow 用」と分かりやすい。既存の他のテーブルと混ざらない。

---

## ステップ1: Supabase にテーブルを3つ追加する

1. Supabase のダッシュボードを開く。
2. 左メニューで **「SQL Editor」** を開く。
3. **「New query」** で新しいクエリを開く。
4. 下の SQL を**そのままコピーして**貼り付ける。
5. **「Run」** を押す。

```sql
-- TaskFlow 用の3テーブル（既存のテーブルには影響しない）

-- ① プロジェクト（フォルダみたいなもの）
CREATE TABLE IF NOT EXISTS public.tf_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2d6b3f',
  icon TEXT NOT NULL DEFAULT '📁'
);

-- ② タスク（やること1件）
CREATE TABLE IF NOT EXISTS public.tf_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  "desc" TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  due DATE,
  done BOOLEAN NOT NULL DEFAULT false,
  created BIGINT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES public.tf_projects(id) ON DELETE CASCADE
);

-- ③ テンプレート（タスクのひな形）
CREATE TABLE IF NOT EXISTS public.tf_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "desc" TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium'
);
```

「Success」と出れば OK。Table Editor で `tf_projects` / `tf_tasks` / `tf_templates` が増えているはず。

---

## ステップ2: 接続に必要な「URL」と「鍵」をメモする

アプリから Supabase にアクセスするには、**プロジェクトのURL** と **anon key（公開してよい鍵）** が必要。

1. 左メニュー **「Project Settings」**（歯車アイコン）を開く。
2. **「API」** をクリック。
3. 次の2つをコピーしてメモ（あとで .env に貼る）:
   - **Project URL**（`https://xxxx.supabase.co` みたいなやつ）
   - **Project API keys** の **anon public**（長い文字列）

---

## ステップ3: 自分のPCのプロジェクトに「鍵」を置く

1. TaskFlow のフォルダ（`taskflow`）の**一番上**に、`.env` というファイルを作る。  
   （すでにあったら開くだけ）
2. 中身を次のようにする。`xxxx` と `eyJ...` のところは、ステップ2でコピーした**本当の値**に置き換える。

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...（ここに anon key を貼る）
```

3. **重要**: `.env` は GitHub に上げない。`.gitignore` に `.env` が入っているか確認する。

---

## ステップ4: Supabase 用のパッケージを入れる

ターミナルで TaskFlow のフォルダにいる状態で、次を実行する。

```bash
npm i @supabase/supabase-js
```

---

## ステップ5: アプリ側のコード（完了済み）

次のファイルを追加・変更して、Supabase とつなげてある。

| ファイル | 役割 |
|----------|------|
| `src/supabase.js` | Supabase に接続するためのクライアント。`.env` の URL と anon key を使う。 |
| `src/api.js` | データの取得・追加・更新。`fetchProjects` / `fetchTasks` / `fetchTemplates`、`insertProject` / `insertTask` / `updateTask` / `insertTemplate`。 |
| `src/App.jsx` | 起動時に API でデータ取得。タスク・プロジェクト・テンプレートの追加・更新は全部 API 経由。読み込み中は「読み込み中...」を表示。 |

**注意**: 初回は DB が空なので、プロジェクトやタスクは自分で追加する。Vercel にデプロイするときは、Vercel の「Environment Variables」に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定すること。

---

## 用語の説明（わからなくなったら見る）

| 用語        | 意味（ざっくり） |
|-------------|------------------|
| テーブル    | データを入れておく「表」。Excel のシートみたいなもの。 |
| カラム      | 表の「列」の名前（例: タイトル、期限、完了したか）。 |
| Supabase    | データをクラウドに保存してくれるサービス。 |
| anon key    | ブラウザから Supabase にアクセスするときに使う「公開用の鍵」。秘密鍵ではない。 |
| .env        | 環境変数を書くファイル。URL や鍵をここに書いて、Git には上げない。 |

---

## いまやることのまとめ（今日やる分）

1. ✅ **ステップ1**: SQL Editor で上記の SQL を実行して、`tf_` のテーブルを3つ作る。
2. ✅ **ステップ2**: Project Settings → API で URL と anon key をコピーする。
3. ✅ **ステップ3**: プロジェクト直下に `.env` を作り、その2つを書いて保存する。
4. ✅ **ステップ4**: `npm i @supabase/supabase-js` を実行する。

5. ✅ **ステップ5**: 上記のとおりコードを入れた。`npm run dev` で起動して動作確認する。

---

## テストの実行

- **全テスト実行**: `npm run test:run`
- **ウォッチモード**: `npm run test`

テストは `src/**/*.test.{js,jsx}` にあり、utils・constants・api（Supabase モック）・TaskCard・TaskForm・App をカバーしている。

---

## テストを「どう使うか」・「どう見るか」（初心者向け）

### 結果はどこで見る？

1. ターミナル（VS Code なら「ターミナル」パネル）を開く。
2. プロジェクトのフォルダで **`npm run test:run`** を実行する。
3. **結果は全部、ターミナルに表示される。**

表示の意味はだいたいこんな感じです。

- **`✓ src/utils.test.js (14 tests) 25ms`**  
  → utils のテストが 14 個あって、全部 **成功（パス）**。
- **`× 〜 returns false for empty`**  
  → その 1 件だけ **失敗（赤）**。
- 最後の行の **`Test Files  6 passed (6)`** と **`Tests  48 passed (48)`**  
  → 「テストファイル 6 個・テスト 48 個が全部成功した」という意味。

「どこか別の画面やレポートを開く」必要はなく、**このターミナルの表示が結果**です。

---

### テストって何？ 何のため？

- **テスト** = 「この関数や画面が、期待どおり動いているか」を **プログラムで自動チェック**する仕組み。
- 「ボタンを押したらこうなる」「日付の計算はこうなる」などを **コードで書いておいて、実行するたびに確認する**イメージ。

**会社で「テスト必須」と言われる理由（ざっくり）：**

- **壊れていないかすぐ分かる**  
  自分や誰かが直したつもりで、別のところを壊してしまうことがある。テストを回せば「前は動いていたことが、今も動いているか」が一瞬で分かる。
- **安心して直せる**  
  「ここ変えたいけど、他が壊れたら怖い」というときに、テストが全部通っていれば「少なくともテストで見ている範囲は大丈夫」と分かる。
- **仕様のメモになる**  
  テストに「こういうときはこう動く」と書いてあるので、「この機能はこういう動きが正解」というメモにもなる。

なので、「テストを書く・テストを回す」＝**「正しく動いているか」を機械に確認してもらう**こと、と捉えると分かりやすいです。

---

### 日常でどう使うのが正解？

- **コードを直したあと**  
  → そのあとで **`npm run test:run`** を 1 回実行して、全部パスするか確認する。
- **本番に上げる前（Git に push する前）**  
  → もう一度 **`npm run test:run`** を実行して、全部通ってから push する、というルールにすると安全。
- **1 個でも失敗（×）が出たら**  
  → 「何かが期待と違う」状態。直した内容を見直すか、期待する動きを変えたならテストの期待値を書き換える。

「テストを書いたら、**このターミナルで結果を見て、全部 ✓ にしておく**」が、いまのところの正解の使い方です。

---

## 真っ黒画面になる原因と再発防止

### なぜ真っ黒になるか（原因）

1. **このアプリの背景色はもともと暗い**（`#0e0e12`）なので、何も表示されないと「真っ黒」に見える。
2. **環境変数が無いと、以前は起動直後にエラーで止まっていた**  
   `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` が無い状態で開くと、Supabase 用のコードが「設定がありません」で **throw** していた。  
   → JavaScript がそこで止まり、React が一切描画されない → 画面には背景色だけ → **真っ黒**。
3. **Vercel などにデプロイしたとき**  
   本番では `.env` は使われない。Vercel の「Environment Variables」に上記 2 つを**入れ忘れる**と、本番ビルドでも同じように環境変数が無く、同じ理由で真っ黒になりやすい。

### いまの対策（コード側）

- **supabase.js**  
  環境変数が無いときは **throw しない**ようにした。代わりに `supabase` を `null` にして、アプリは一度きちんと描画される。
- **api.js**  
  実際に API を呼ぶときに「設定がありません」と分かるエラーを投げ、**画面上のトーストでメッセージを表示**する。真っ黒のままにはならない。
- **ErrorBoundary**  
  その他の予期しないエラーでアプリが落ちても、**「エラーが発生しました」とメッセージを出す画面**に切り替わるようにした。真っ黒で終わらない。

### 再発防止（あなたがやること）

| やること | 説明 |
|----------|------|
| **Vercel にデプロイするとき** | 必ず **Project Settings → Environment Variables** で `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定する。設定後に再デプロイする。 |
| **ローカルで開いて真っ黒になったら** | プロジェクト直下に `.env` があるか、中身に上記 2 つが書いてあるか確認する。 |
| **「設定がありません」のトーストが出たら** | 上記のどちらか（Vercel の環境変数 or ローカルの .env）が足りていない。メッセージのとおり設定を足す。 |

これで「環境変数忘れ」で真っ黒になることは避けられる。

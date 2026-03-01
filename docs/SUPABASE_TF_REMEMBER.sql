-- クライアント（取引先・担当先）と「今後に向けて覚えておくこと」をプロジェクトと別で管理する用
-- プロジェクトはいつか終わるが、クライアントごとのメモは残しておける
-- 使い方: Supabase ダッシュボード → SQL Editor → この内容を貼り付けて Run

-- 既存の tf_remember が project_id で作ってある場合は削除して作り直す（データは消える）
DROP TABLE IF EXISTS public.tf_remember;

-- クライアント（プロジェクトとは別。取引先・担当先の単位）
CREATE TABLE IF NOT EXISTS public.tf_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2d6b3f',
  icon TEXT NOT NULL DEFAULT '🤝'
);

-- 覚えておくこと（クライアントごと。プロジェクトには紐づけない）
CREATE TABLE IF NOT EXISTS public.tf_remember (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.tf_clients(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created BIGINT NOT NULL
);

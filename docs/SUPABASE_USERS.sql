-- 担当者機能: ユーザー（チームメンバー）テーブル
CREATE TABLE IF NOT EXISTS public.tf_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created BIGINT NOT NULL
);

-- タスクに担当者を紐付け
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS assignee_id TEXT REFERENCES public.tf_users(id);

-- RLS など必要なポリシーはプロジェクトに合わせて追加

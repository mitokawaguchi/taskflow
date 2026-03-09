-- =============================================================================
-- 既存データをアカウントに紐づける用: owner_id カラム追加
-- =============================================================================
-- 前提: Supabase Auth でユーザーが作成されていること（auth.users）
-- 実行後: 既存行は owner_id = NULL のまま。ログイン後に「紐づけ」で一括設定可能。
-- =============================================================================

-- プロジェクト
ALTER TABLE public.tf_projects
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- タスク
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- テンプレート
ALTER TABLE public.tf_templates
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- カテゴリ
ALTER TABLE public.tf_categories
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- チームメンバー（tf_users）
ALTER TABLE public.tf_users
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- クライアント
ALTER TABLE public.tf_clients
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 覚えておくこと
ALTER TABLE public.tf_remember
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- インデックス（ログイン後の絞り込み用）
CREATE INDEX IF NOT EXISTS idx_tf_projects_owner_id ON public.tf_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tf_tasks_owner_id ON public.tf_tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tf_templates_owner_id ON public.tf_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_tf_categories_owner_id ON public.tf_categories(owner_id);
CREATE INDEX IF NOT EXISTS idx_tf_users_owner_id ON public.tf_users(owner_id);
CREATE INDEX IF NOT EXISTS idx_tf_clients_owner_id ON public.tf_clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_tf_remember_owner_id ON public.tf_remember(owner_id);

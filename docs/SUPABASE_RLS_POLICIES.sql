-- =============================================================================
-- Row Level Security (RLS) — 全テーブルでマルチテナント分離を強制
-- =============================================================================
-- 前提: SUPABASE_OWNER_LINK.sql で owner_id が追加済みであること
-- 実行: Supabase Dashboard → SQL Editor → このファイルを貼り付けて Run
-- 効果: 他ユーザーのデータの読み取り・更新・削除が DB レベルで不可になる
-- =============================================================================

-- ヘルパー: 現在ユーザーが「見てよい行」＝ owner_id が自分（security.mdc 規約: owner_id IS NULL 禁止）
CREATE OR REPLACE FUNCTION public.tf_owner_visible(owner_id_col UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN owner_id_col = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ヘルパー: 挿入・更新時に owner_id が自分のみ許可
CREATE OR REPLACE FUNCTION public.tf_owner_writable(owner_id_col UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN owner_id_col = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------------------------------
-- tf_projects
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_projects_select" ON public.tf_projects;
CREATE POLICY "tf_projects_select" ON public.tf_projects
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_projects_insert" ON public.tf_projects;
CREATE POLICY "tf_projects_insert" ON public.tf_projects
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_projects_update" ON public.tf_projects;
CREATE POLICY "tf_projects_update" ON public.tf_projects
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_projects_delete" ON public.tf_projects;
CREATE POLICY "tf_projects_delete" ON public.tf_projects
  FOR DELETE USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- tf_tasks
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_tasks_select" ON public.tf_tasks;
CREATE POLICY "tf_tasks_select" ON public.tf_tasks
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_tasks_insert" ON public.tf_tasks;
CREATE POLICY "tf_tasks_insert" ON public.tf_tasks
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_tasks_update" ON public.tf_tasks;
CREATE POLICY "tf_tasks_update" ON public.tf_tasks
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_tasks_delete" ON public.tf_tasks;
CREATE POLICY "tf_tasks_delete" ON public.tf_tasks
  FOR DELETE USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- tf_templates
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_templates_select" ON public.tf_templates;
CREATE POLICY "tf_templates_select" ON public.tf_templates
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_templates_insert" ON public.tf_templates;
CREATE POLICY "tf_templates_insert" ON public.tf_templates
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_templates_update" ON public.tf_templates;
CREATE POLICY "tf_templates_update" ON public.tf_templates
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_templates_delete" ON public.tf_templates;
CREATE POLICY "tf_templates_delete" ON public.tf_templates
  FOR DELETE USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- tf_categories
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_categories_select" ON public.tf_categories;
CREATE POLICY "tf_categories_select" ON public.tf_categories
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_categories_insert" ON public.tf_categories;
CREATE POLICY "tf_categories_insert" ON public.tf_categories
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_categories_update" ON public.tf_categories;
CREATE POLICY "tf_categories_update" ON public.tf_categories
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_categories_delete" ON public.tf_categories;
CREATE POLICY "tf_categories_delete" ON public.tf_categories
  FOR DELETE USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- tf_users
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_users_select" ON public.tf_users;
CREATE POLICY "tf_users_select" ON public.tf_users
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_users_insert" ON public.tf_users;
CREATE POLICY "tf_users_insert" ON public.tf_users
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_users_update" ON public.tf_users;
CREATE POLICY "tf_users_update" ON public.tf_users
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_users_delete" ON public.tf_users;
CREATE POLICY "tf_users_delete" ON public.tf_users
  FOR DELETE USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- tf_clients
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_clients_select" ON public.tf_clients;
CREATE POLICY "tf_clients_select" ON public.tf_clients
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_clients_insert" ON public.tf_clients;
CREATE POLICY "tf_clients_insert" ON public.tf_clients
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_clients_update" ON public.tf_clients;
CREATE POLICY "tf_clients_update" ON public.tf_clients
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_clients_delete" ON public.tf_clients;
CREATE POLICY "tf_clients_delete" ON public.tf_clients
  FOR DELETE USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- tf_remember
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_remember ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_remember_select" ON public.tf_remember;
CREATE POLICY "tf_remember_select" ON public.tf_remember
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_remember_insert" ON public.tf_remember;
CREATE POLICY "tf_remember_insert" ON public.tf_remember
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_remember_update" ON public.tf_remember;
CREATE POLICY "tf_remember_update" ON public.tf_remember
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_remember_delete" ON public.tf_remember;
CREATE POLICY "tf_remember_delete" ON public.tf_remember
  FOR DELETE USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- tf_notes（メモ帳）
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_notes_select" ON public.tf_notes;
CREATE POLICY "tf_notes_select" ON public.tf_notes
  FOR SELECT USING (public.tf_owner_visible(owner_id));

DROP POLICY IF EXISTS "tf_notes_insert" ON public.tf_notes;
CREATE POLICY "tf_notes_insert" ON public.tf_notes
  FOR INSERT WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_notes_update" ON public.tf_notes;
CREATE POLICY "tf_notes_update" ON public.tf_notes
  FOR UPDATE USING (public.tf_owner_visible(owner_id))
  WITH CHECK (public.tf_owner_writable(owner_id));

DROP POLICY IF EXISTS "tf_notes_delete" ON public.tf_notes;
CREATE POLICY "tf_notes_delete" ON public.tf_notes
  FOR DELETE USING (owner_id = auth.uid());

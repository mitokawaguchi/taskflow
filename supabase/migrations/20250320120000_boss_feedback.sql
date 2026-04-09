-- 上司レビュー指摘の記録（ユーザーごとに RLS で分離）
CREATE TABLE IF NOT EXISTS public.boss_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL,
  description text NOT NULL,
  example_before text,
  example_after text,
  project_name text,
  frequency integer NOT NULL DEFAULT 1,
  memo text,
  CONSTRAINT boss_feedback_category_check CHECK (
    category IN ('誤字', '表現', '内容の精度', 'フォーマット', 'その他')
  ),
  CONSTRAINT boss_feedback_frequency_check CHECK (frequency >= 1)
);

CREATE INDEX IF NOT EXISTS boss_feedback_owner_id_idx ON public.boss_feedback (owner_id);
CREATE INDEX IF NOT EXISTS boss_feedback_category_idx ON public.boss_feedback (category);

ALTER TABLE public.boss_feedback ENABLE ROW LEVEL SECURITY;

-- 手動再実行・重複適用でも落ちないようにする
DROP POLICY IF EXISTS "boss_feedback_select_own" ON public.boss_feedback;
DROP POLICY IF EXISTS "boss_feedback_insert_own" ON public.boss_feedback;
DROP POLICY IF EXISTS "boss_feedback_update_own" ON public.boss_feedback;
DROP POLICY IF EXISTS "boss_feedback_delete_own" ON public.boss_feedback;

CREATE POLICY "boss_feedback_select_own"
  ON public.boss_feedback FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "boss_feedback_insert_own"
  ON public.boss_feedback FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "boss_feedback_update_own"
  ON public.boss_feedback FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "boss_feedback_delete_own"
  ON public.boss_feedback FOR DELETE
  USING (owner_id = auth.uid());

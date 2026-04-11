-- 日次プラン（今日/明日の並び）と午前3時 JST 相当のロールオーバー用
CREATE TABLE IF NOT EXISTS public.tf_user_daily_planner (
  owner_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  today_task_ids text[] NOT NULL DEFAULT '{}'::text[],
  tomorrow_task_ids text[] NOT NULL DEFAULT '{}'::text[],
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tf_user_daily_planner_updated_idx ON public.tf_user_daily_planner (updated_at DESC);

ALTER TABLE public.tf_user_daily_planner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tf_user_daily_planner_select_own" ON public.tf_user_daily_planner;
DROP POLICY IF EXISTS "tf_user_daily_planner_insert_own" ON public.tf_user_daily_planner;
DROP POLICY IF EXISTS "tf_user_daily_planner_update_own" ON public.tf_user_daily_planner;
DROP POLICY IF EXISTS "tf_user_daily_planner_delete_own" ON public.tf_user_daily_planner;

CREATE POLICY "tf_user_daily_planner_select_own"
  ON public.tf_user_daily_planner FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "tf_user_daily_planner_insert_own"
  ON public.tf_user_daily_planner FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "tf_user_daily_planner_update_own"
  ON public.tf_user_daily_planner FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "tf_user_daily_planner_delete_own"
  ON public.tf_user_daily_planner FOR DELETE
  USING (owner_id = auth.uid());

-- 明日 → 今日へ繰り越し、今日はクリア（全ユーザー一括）。pg_cron 等から 1 日 1 回実行想定（UTC 18:00 = JST 翌日 03:00）
CREATE OR REPLACE FUNCTION public.tf_rollover_daily_planner ()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.tf_user_daily_planner
  SET
    today_task_ids = tomorrow_task_ids,
    tomorrow_task_ids = '{}'::text[],
    updated_at = now();
$$;

REVOKE ALL ON FUNCTION public.tf_rollover_daily_planner () FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_rollover_daily_planner () TO service_role;

COMMENT ON FUNCTION public.tf_rollover_daily_planner IS
  'JST 午前3時の日付切り替えに合わせ、明日の並びを今日へ移し今日を空にする。pg_cron: 0 18 * * * (UTC) で前日 JST 深夜相当を狙うか、プロジェクトのタイムゾーンに合わせ調整。';

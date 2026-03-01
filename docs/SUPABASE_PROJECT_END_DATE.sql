-- プロジェクトに終了日を追加（今日から残り何日かを表示する用）
-- 使い方: Supabase ダッシュボード → SQL Editor → この内容を貼り付けて Run

ALTER TABLE public.tf_projects
ADD COLUMN IF NOT EXISTS end_date DATE;

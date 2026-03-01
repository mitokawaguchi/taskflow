-- プロジェクトの並び順用カラム追加
-- 使い方: Supabase ダッシュボード → SQL Editor → この内容を貼り付けて Run

ALTER TABLE public.tf_projects
ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- 既存行に id 順で sort_order を付与（任意）
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn
  FROM public.tf_projects
)
UPDATE public.tf_projects p
SET sort_order = ordered.rn
FROM ordered
WHERE p.id = ordered.id;

-- 目的意識をデータとして保持するため、主要エンティティへ purpose を追加
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS purpose text;

UPDATE public.tf_tasks
SET purpose = COALESCE(NULLIF(trim("desc"), ''), title, '目的未設定')
WHERE purpose IS NULL OR trim(purpose) = '';

ALTER TABLE public.tf_tasks
  ALTER COLUMN purpose SET NOT NULL;

ALTER TABLE public.tf_tasks
  DROP CONSTRAINT IF EXISTS tf_tasks_purpose_nonempty;

ALTER TABLE public.tf_tasks
  ADD CONSTRAINT tf_tasks_purpose_nonempty CHECK (char_length(trim(purpose)) > 0);

ALTER TABLE public.tf_projects
  ADD COLUMN IF NOT EXISTS purpose text;

UPDATE public.tf_projects
SET purpose = COALESCE(NULLIF(trim(name), ''), '目的未設定')
WHERE purpose IS NULL OR trim(purpose) = '';

ALTER TABLE public.tf_projects
  ALTER COLUMN purpose SET NOT NULL;

ALTER TABLE public.tf_projects
  DROP CONSTRAINT IF EXISTS tf_projects_purpose_nonempty;

ALTER TABLE public.tf_projects
  ADD CONSTRAINT tf_projects_purpose_nonempty CHECK (char_length(trim(purpose)) > 0);

ALTER TABLE public.boss_feedback
  ADD COLUMN IF NOT EXISTS purpose text;

UPDATE public.boss_feedback
SET purpose = COALESCE(NULLIF(trim(description), ''), '目的未設定')
WHERE purpose IS NULL OR trim(purpose) = '';

ALTER TABLE public.boss_feedback
  ALTER COLUMN purpose SET NOT NULL;

ALTER TABLE public.boss_feedback
  DROP CONSTRAINT IF EXISTS boss_feedback_purpose_nonempty;

ALTER TABLE public.boss_feedback
  ADD CONSTRAINT boss_feedback_purpose_nonempty CHECK (char_length(trim(purpose)) > 0);

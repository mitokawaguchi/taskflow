-- 目的（未入力は NULL。新規登録の必須チェックはアプリ側。空文字のみ禁止）
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS purpose text;

ALTER TABLE public.tf_projects
  ADD COLUMN IF NOT EXISTS purpose text;

ALTER TABLE public.boss_feedback
  ADD COLUMN IF NOT EXISTS purpose text;

ALTER TABLE public.tf_tasks DROP CONSTRAINT IF EXISTS tf_tasks_purpose_nonempty;
ALTER TABLE public.tf_tasks
  ADD CONSTRAINT tf_tasks_purpose_nonempty CHECK (purpose IS NULL OR char_length(trim(purpose)) > 0);

ALTER TABLE public.tf_projects DROP CONSTRAINT IF EXISTS tf_projects_purpose_nonempty;
ALTER TABLE public.tf_projects
  ADD CONSTRAINT tf_projects_purpose_nonempty CHECK (purpose IS NULL OR char_length(trim(purpose)) > 0);

ALTER TABLE public.boss_feedback DROP CONSTRAINT IF EXISTS boss_feedback_purpose_nonempty;
ALTER TABLE public.boss_feedback
  ADD CONSTRAINT boss_feedback_purpose_nonempty CHECK (purpose IS NULL OR char_length(trim(purpose)) > 0);

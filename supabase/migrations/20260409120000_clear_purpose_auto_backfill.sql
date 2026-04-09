-- 初回マイグレで自動補完した purpose を削除し、未入力は NULL にする（新規はアプリ側で必須）

ALTER TABLE public.tf_tasks DROP CONSTRAINT IF EXISTS tf_tasks_purpose_nonempty;
ALTER TABLE public.tf_projects DROP CONSTRAINT IF EXISTS tf_projects_purpose_nonempty;
ALTER TABLE public.boss_feedback DROP CONSTRAINT IF EXISTS boss_feedback_purpose_nonempty;

ALTER TABLE public.tf_tasks ALTER COLUMN purpose DROP NOT NULL;
ALTER TABLE public.tf_projects ALTER COLUMN purpose DROP NOT NULL;
ALTER TABLE public.boss_feedback ALTER COLUMN purpose DROP NOT NULL;

UPDATE public.tf_tasks
SET purpose = NULL
WHERE purpose IS NOT NULL
  AND (
    trim(purpose) = '目的未設定'
    OR (
      NULLIF(trim(COALESCE("desc", '')), '') IS NOT NULL
      AND trim(purpose) = trim("desc")
    )
    OR (
      NULLIF(trim(COALESCE("desc", '')), '') IS NULL
      AND purpose IS NOT DISTINCT FROM title
    )
  );

UPDATE public.tf_projects
SET purpose = NULL
WHERE purpose IS NOT NULL
  AND (
    trim(purpose) = '目的未設定'
    OR trim(purpose) = trim(name)
  );

UPDATE public.boss_feedback
SET purpose = NULL
WHERE purpose IS NOT NULL
  AND (
    trim(purpose) = '目的未設定'
    OR trim(purpose) = trim(description)
  );

ALTER TABLE public.tf_tasks
  ADD CONSTRAINT tf_tasks_purpose_nonempty CHECK (purpose IS NULL OR char_length(trim(purpose)) > 0);

ALTER TABLE public.tf_projects
  ADD CONSTRAINT tf_projects_purpose_nonempty CHECK (purpose IS NULL OR char_length(trim(purpose)) > 0);

ALTER TABLE public.boss_feedback
  ADD CONSTRAINT boss_feedback_purpose_nonempty CHECK (purpose IS NULL OR char_length(trim(purpose)) > 0);

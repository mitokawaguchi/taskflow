-- =============================================================================
-- タスクテーブル（tf_tasks）スキーマ — ガント・カンバン・ダッシュボード対応
-- =============================================================================
-- 使い方:
--  - 新規プロジェクト: (1) のみ実行
--  - 既存プロジェクト: (2)(3) を順に実行（status は SUPABASE_TASK_STATUS.sql で追加済みの場合は (3) のみ）
-- =============================================================================

-- -----------------------------------------------------------------------------
-- (1) 新規作成用: テーブルが無い場合のフル定義（参考）
-- -----------------------------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS public.tf_tasks (
--   id          TEXT    PRIMARY KEY,
--   project_id  TEXT    NOT NULL REFERENCES public.tf_projects(id) ON DELETE CASCADE,
--   title       TEXT    NOT NULL,
--   desc        TEXT    DEFAULT '',
--   priority    TEXT    NOT NULL DEFAULT 'medium',
--   due         DATE,
--   done        BOOLEAN NOT NULL DEFAULT false,
--   status      TEXT    NOT NULL DEFAULT 'todo',
--   start_date  DATE,
--   progress    SMALLINT,
--   created     BIGINT  NOT NULL
-- );
-- COMMENT ON COLUMN public.tf_tasks.status IS 'todo | in_progress | review | done';
-- COMMENT ON COLUMN public.tf_tasks.start_date IS 'ガント用: 開始日（未設定時は due のみ表示）';
-- COMMENT ON COLUMN public.tf_tasks.progress IS '0-100。未設定時は status から算出';

-- -----------------------------------------------------------------------------
-- (2) 状態（カンバン用）— 未実施なら実行（SUPABASE_TASK_STATUS.sql と同等）
-- -----------------------------------------------------------------------------
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'todo';

UPDATE public.tf_tasks
  SET status = 'done'
  WHERE done = true AND (status IS NULL OR status = 'todo');

-- 制約で有効値に限定（SEC-004: サーバーサイドバリデーション）
ALTER TABLE public.tf_tasks
  DROP CONSTRAINT IF EXISTS tf_tasks_status_check;
ALTER TABLE public.tf_tasks
  ADD CONSTRAINT tf_tasks_status_check
  CHECK (status IN ('todo', 'in_progress', 'review', 'done'));

-- -----------------------------------------------------------------------------
-- (3) ガント・進捗用の追加カラム
-- -----------------------------------------------------------------------------
-- 開始日: ガントで「開始〜期限」のバーを描く用。NULL の場合は due の日付のみ表示
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS start_date DATE;

-- 進捗率 0-100: 未設定時はアプリ側で status から算出。手入力する場合はここに保存
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS progress SMALLINT;

-- 0〜100 に制限（SEC-004）
ALTER TABLE public.tf_tasks
  DROP CONSTRAINT IF EXISTS tf_tasks_progress_range;
ALTER TABLE public.tf_tasks
  ADD CONSTRAINT tf_tasks_progress_range
  CHECK (progress IS NULL OR (progress >= 0 AND progress <= 100));

-- -----------------------------------------------------------------------------
-- カラム一覧（参照用）
-- -----------------------------------------------------------------------------
-- id          TEXT     PK
-- project_id  TEXT     FK → tf_projects(id)
-- title       TEXT
-- desc        TEXT
-- priority    TEXT     default 'medium'
-- due         DATE     期限
-- done        BOOLEAN  default false（status='done' と同期）
-- status      TEXT     default 'todo'  （todo|in_progress|review|done）
-- start_date  DATE     ガント用開始日（任意）
-- progress    SMALLINT 0-100（任意）
-- created     BIGINT

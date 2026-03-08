-- タスクに状態（カンバン用）を追加
-- 実行: Supabase SQL Editor で実行

ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'todo';

-- 既存データ: done = true なら status = 'done'
UPDATE public.tf_tasks
  SET status = 'done'
  WHERE done = true AND (status IS NULL OR status = 'todo');

-- 有効な値に制限したい場合（オプション）:
-- ALTER TABLE public.tf_tasks
--   ADD CONSTRAINT tf_tasks_status_check
--   CHECK (status IN ('todo', 'in_progress', 'review', 'done'));

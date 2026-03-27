-- =============================================================================
-- 既存の tf_notes にプレーンテキスト列を追加（初回作成後に一度だけ実行）
-- =============================================================================
-- 新規に SUPABASE_TF_NOTES.sql だけを流した場合は body_text は既に含まれるため不要
-- =============================================================================

ALTER TABLE public.tf_notes
  ADD COLUMN IF NOT EXISTS body_text TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.tf_notes.body_text IS 'メモ本文（プレーンテキスト）。手書きは snapshot 側';

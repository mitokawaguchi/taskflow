-- =============================================================================
-- メモ帳（tldraw スナップショット）tf_notes
-- =============================================================================
-- 実行: Supabase Dashboard → SQL Editor → Run
-- 前提: auth.users が存在すること
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tf_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '無題のメモ',
  snapshot JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tf_notes_owner_id ON public.tf_notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_tf_notes_updated_at ON public.tf_notes(owner_id, updated_at DESC);

COMMENT ON TABLE public.tf_notes IS '手書きメモ（tldraw スナップショット JSON）';

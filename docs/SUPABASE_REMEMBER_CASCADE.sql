-- REL-002: クライアント削除時に紐づく remember を自動削除（不整合防止）
-- 実行: Supabase SQL Editor で RLS 適用後に実行
ALTER TABLE public.tf_remember
  DROP CONSTRAINT IF EXISTS tf_remember_client_id_fkey;
ALTER TABLE public.tf_remember
  ADD CONSTRAINT tf_remember_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.tf_clients(id)
  ON DELETE CASCADE;

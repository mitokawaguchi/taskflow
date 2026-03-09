-- タスクにカテゴリを追加
ALTER TABLE public.tf_tasks
  ADD COLUMN IF NOT EXISTS category TEXT;

-- カテゴリマスタ（任意）
CREATE TABLE IF NOT EXISTS public.tf_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280'
);

-- 初期データ
INSERT INTO public.tf_categories (id, name, color) VALUES
  ('design', 'デザイン', '#3b82f6'),
  ('dev', '開発', '#8b5cf6'),
  ('bug', 'バグ修正', '#ef4444'),
  ('docs', 'ドキュメント', '#06b6d4'),
  ('other', 'その他', '#6b7280'),
  ('event', 'イベント', '#ec4899'),
  ('routine', '定例業務', '#14b8a6')
ON CONFLICT (id) DO NOTHING;

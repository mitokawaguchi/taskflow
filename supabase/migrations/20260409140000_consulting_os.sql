-- 外コンOS: tf_tasks 拡張（アプリのタスクテーブルは tf_tasks）
ALTER TABLE public.tf_tasks ADD COLUMN IF NOT EXISTS hypothesis TEXT;
ALTER TABLE public.tf_tasks ADD COLUMN IF NOT EXISTS timebox_minutes INTEGER;
ALTER TABLE public.tf_tasks ADD COLUMN IF NOT EXISTS premortem_risks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tf_tasks ADD COLUMN IF NOT EXISTS next_task_id TEXT REFERENCES public.tf_tasks (id) ON DELETE SET NULL;
-- Phase 3–4 集計用（タイマー開始・完了時刻）
ALTER TABLE public.tf_tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.tf_tasks ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS tf_tasks_next_task_id_idx ON public.tf_tasks (next_task_id);
CREATE INDEX IF NOT EXISTS tf_tasks_owner_hypothesis_idx ON public.tf_tasks (owner_id) WHERE hypothesis IS NOT NULL AND trim(hypothesis) <> '';

-- 週次レビュー
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  top_achievements JSONB DEFAULT '[]'::jsonb,
  wasted_efforts JSONB DEFAULT '[]'::jsonb,
  hypothesis_results JSONB DEFAULT '[]'::jsonb,
  next_week_focus JSONB DEFAULT '[]'::jsonb,
  growth_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT weekly_reviews_week_order CHECK (week_start <= week_end)
);

CREATE UNIQUE INDEX IF NOT EXISTS weekly_reviews_owner_week_idx ON public.weekly_reviews (owner_id, week_start);

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_reviews_select_own"
  ON public.weekly_reviews FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "weekly_reviews_insert_own"
  ON public.weekly_reviews FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "weekly_reviews_update_own"
  ON public.weekly_reviews FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "weekly_reviews_delete_own"
  ON public.weekly_reviews FOR DELETE
  USING (owner_id = auth.uid());

-- コンサルフレームワークマスタ（参照のみ・認証ユーザーに公開）
CREATE TABLE IF NOT EXISTS public.consulting_frameworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL CHECK (category IN ('thinking', 'work_method', 'mindset')),
  definition TEXT NOT NULL,
  usage_prompt TEXT,
  automation_potential TEXT CHECK (automation_potential IN ('High', 'Medium', 'Low')),
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.consulting_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consulting_frameworks_select_authenticated"
  ON public.consulting_frameworks FOR SELECT
  TO authenticated
  USING (true);

-- 初期データ（初回のみ投入）
INSERT INTO public.consulting_frameworks (name, name_en, category, definition, usage_prompt, automation_potential, sort_order)
SELECT name, name_en, category, definition, usage_prompt, automation_potential, sort_order
FROM (
  VALUES
    ('ピラミッド原則', 'Pyramid Principle', 'thinking', '結論を先に、根拠をグルーピングして提示する。', '結論は一文で言えるか？', 'Medium', 1),
    ('MECE', 'MECE', 'thinking', '漏れなくダブりなく要素を分解する。', '抜け・重複はないか？', 'Medium', 2),
    ('So What?', 'So What', 'thinking', 'その事実から何が言えるかを繰り返し問う。', '聞き手にとっての意味は？', 'High', 3),
    ('仮説思考', 'Hypothesis-driven', 'thinking', '検証可能な仮説を先に置き、データで潰す。', '最初に置いた答えは何か？', 'High', 4),
    ('Issue Tree', 'Issue Tree', 'thinking', '課題を論点に分解し、構造化する。', '根本原因の候補は何か？', 'Medium', 5),
    ('ロジックツリー', 'Logic Tree', 'thinking', 'Why/How で因果をツリー化する。', 'なぜそう言えるか？', 'Medium', 6),
    ('8020（パレート）', '80/20', 'thinking', 'インパクトの大きい少数に集中する。', '成果の8割を生む2割はどこか？', 'Low', 7),
    ('フレームワーク思考', 'Framework', 'work_method', '既存フレームを借りて思考の抜けを防ぐ。', '適切な枠はどれか？', 'Medium', 8),
    ('タイムボクシング', 'Timeboxing', 'work_method', '時間の上限を決めて完璧主義を防ぐ。', '何分で区切るか？', 'High', 9),
    ('プレモーテム', 'Premortem', 'work_method', '失敗を仮定してリスクを先取りする。', '失敗するとしたら最大の要因は？', 'Medium', 10),
    ('ステークホルダー分析', 'Stakeholder map', 'work_method', '関係者の利害と影響度を整理する。', '誰が決裁・誰が抵抗するか？', 'Low', 11),
    ('オーナーシップ', 'Ownership', 'mindset', '成果に責任を持ち、越境して動く。', '自分が止める理由はないか？', 'Low', 12)
) AS v(name, name_en, category, definition, usage_prompt, automation_potential, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.consulting_frameworks LIMIT 1);

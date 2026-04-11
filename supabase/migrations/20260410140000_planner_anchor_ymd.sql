-- 今日/明日プランの「どの営業日分か」を保持し、JST 午前3時相当のクライアント側ロールオーバーと整合させる
ALTER TABLE public.tf_user_daily_planner
  ADD COLUMN IF NOT EXISTS planner_anchor_ymd text;

COMMENT ON COLUMN public.tf_user_daily_planner.planner_anchor_ymd IS
  'Asia/Tokyo で午前3時未満は前日扱いとした「プランの基準日」YYYY-MM-DD。前回保存時と getEffectivePlannerYmd がずれたら明日→今日へ繰り越す';

-- CODE-008: 期限超過タスクの priority を critical に更新（サーバー側で実行する場合）
-- 実行: Supabase SQL Editor または pg_cron で定期実行
-- クライアントのみの更新だと未開封時・複数デバイスで競合するため、DB 側で一元管理する場合に使用

CREATE OR REPLACE FUNCTION public.tf_set_overdue_priority_critical()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE public.tf_tasks
    SET priority = 'critical'
    WHERE due IS NOT NULL
      AND due < (CURRENT_DATE)::TEXT
      AND (done = false OR status IS NULL OR status != 'done')
      AND (priority IS NULL OR priority != 'critical')
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO updated_count FROM updated;
  RETURN updated_count;
END;
$$;

-- 手動で1回実行する例:
-- SELECT public.tf_set_overdue_priority_critical();

-- pg_cron で毎日実行する場合（Supabase で cron 拡張が有効なとき）:
-- SELECT cron.schedule('overdue-priority', '0 0 * * *', $$SELECT public.tf_set_overdue_priority_critical()$$);

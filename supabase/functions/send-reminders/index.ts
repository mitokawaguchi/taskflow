/**
 * 期限リマインドを Chatwork マイチャットへ送信する Edge Function。
 * シークレットは Supabase Dashboard → Edge Functions → send-reminders に設定。
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { classifyReminderTasks, hasNoReminders } from '../_shared/reminder-logic.ts'
import { formatCombinedChatworkBody } from '../_shared/reminder-messages.ts'
import { postChatworkMessage } from '../_shared/chatwork-post.ts'
import { todayYmdInJst } from '../_shared/date-jst.ts'
import { loadTasksForReminders } from '../_shared/load-reminder-tasks.ts'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function verifyCron(req: Request): boolean {
  const secret = Deno.env.get('REMINDER_CRON_SECRET')
  if (!secret) return true
  const auth = req.headers.get('Authorization')
  return auth === `Bearer ${secret}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    if (!verifyCron(req)) return json({ error: 'unauthorized' }, 401)

    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const cwToken = Deno.env.get('CHATWORK_API_TOKEN')
    const cwRoom = Deno.env.get('CHATWORK_MY_ROOM_ID')
    if (!url || !key) return json({ error: 'missing_supabase_env' }, 500)
    if (!cwToken || !cwRoom) return json({ error: 'missing_chatwork_env' }, 500)

    const ownerFilter = Deno.env.get('REMINDER_OWNER_ID')?.trim() || null
    const supabase = createClient(url, key)
    const inputs = await loadTasksForReminders(supabase, ownerFilter)
    const today = todayYmdInJst()
    const classified = classifyReminderTasks(inputs, today)

    if (hasNoReminders(classified)) {
      return json({ ok: true, sent: false, reason: 'no_reminders', today })
    }

    const body = formatCombinedChatworkBody(classified)
    await postChatworkMessage({ apiToken: cwToken, roomId: cwRoom, body })

    return json({
      ok: true,
      sent: true,
      today,
      counts: {
        three_days: classified.three_days.length,
        one_day: classified.one_day.length,
        due_today: classified.due_today.length,
      },
    })
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : 'unknown_error'
    return json({ ok: false, error: msg }, 500)
  }
})

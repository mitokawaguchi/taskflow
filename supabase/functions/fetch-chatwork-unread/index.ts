/**
 * Chatwork 未返信一覧（API トークンは Edge Secrets のみ）。クライアントは JWT で認証。
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { pickOldestUnansweredMention, type CwMessageLike } from '../_shared/chatwork-unread-logic.ts'

const MAX_ROOMS = 15
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type CwRoom = { room_id: number; name: string }

type OutRow = {
  kind: 'chatwork'
  id: string
  roomId: string
  roomName: string
  from: string
  preview: string
  receivedAt: string
  openUrl: string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function cwGet<T>(apiToken: string, path: string): Promise<T> {
  const res = await fetch(`https://api.chatwork.com/v2${path}`, {
    headers: { 'X-ChatWorkToken': apiToken },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Chatwork (${res.status}): ${text.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const anon = Deno.env.get('SUPABASE_ANON_KEY')
    const cwToken = Deno.env.get('CHATWORK_API_TOKEN')
    const myIdRaw = Deno.env.get('CHATWORK_MY_ACCOUNT_ID')
    if (!url || !anon) return json({ error: 'missing_supabase_env' }, 500)
    if (!cwToken || !myIdRaw) return json({ error: 'missing_chatwork_env' }, 500)

    const myAccountId = Number(myIdRaw.trim())
    if (!Number.isFinite(myAccountId)) return json({ error: 'invalid_chatwork_account_id' }, 500)

    const auth = req.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)
    const jwt = auth.slice(7)
    const supabase = createClient(url, anon)
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(jwt)
    if (authErr || !user) return json({ error: 'unauthorized' }, 401)

    const rooms = await cwGet<CwRoom[]>(cwToken, '/rooms')
    const slice = Array.isArray(rooms) ? rooms.slice(0, MAX_ROOMS) : []
    const items: OutRow[] = []

    for (const room of slice) {
      const msgs = await cwGet<CwMessageLike[]>(
        cwToken,
        `/rooms/${room.room_id}/messages?force=0`,
      )
      if (!Array.isArray(msgs) || msgs.length === 0) continue
      const picked = pickOldestUnansweredMention(msgs, myAccountId)
      if (!picked) continue
      const receivedAt = new Date(picked.sendAtSec * 1000).toISOString()
      items.push({
        kind: 'chatwork',
        id: `cw-${room.room_id}`,
        roomId: String(room.room_id),
        roomName: room.name ?? `room ${room.room_id}`,
        from: picked.from,
        preview: picked.preview,
        receivedAt,
        openUrl: `https://www.chatwork.com/#!rid${room.room_id}`,
      })
    }

    items.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))

    return json({ ok: true, items })
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : 'unknown_error'
    return json({ ok: false, error: msg }, 500)
  }
})

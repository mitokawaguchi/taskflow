import type { GmailMessageSummary } from './types'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1'

type ListResponse = { messages?: Array<{ id: string; threadId?: string }> }

type MsgDetail = {
  id: string
  threadId?: string
  internalDate?: string
  payload?: { headers?: Array<{ name?: string; value?: string }> }
}

function headerOf(m: MsgDetail, key: string): string {
  const k = key.toLowerCase()
  const h = m.payload?.headers ?? []
  const row = h.find((x) => (x.name ?? '').toLowerCase() === k)
  return row?.value ?? ''
}

export const DEFAULT_GMAIL_QUERY = 'is:inbox -label:sent'

async function fetchOneSummary(accessToken: string, id: string, threadHint?: string): Promise<GmailMessageSummary | null> {
  const detailRes = await fetch(
    `${GMAIL_API}/users/me/messages/${encodeURIComponent(id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!detailRes.ok) return null
  const detail = (await detailRes.json()) as MsgDetail
  const from = headerOf(detail, 'From')
  const subject = headerOf(detail, 'Subject')
  const dateHeader = headerOf(detail, 'Date')
  const internalMs = detail.internalDate ? Number(detail.internalDate) : Date.parse(dateHeader)
  const receivedIso = Number.isFinite(internalMs)
    ? new Date(internalMs).toISOString()
    : new Date().toISOString()
  const tid = detail.threadId ?? threadHint ?? id
  return {
    id: detail.id,
    threadId: tid,
    from,
    subject,
    receivedAt: receivedIso,
    gmailWebUrl: `https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(tid)}`,
  }
}

/** 最新 maxResults 件を取得（accessToken は OAuth で得た短期トークン） */
export async function fetchInboxMessageSummaries(
  accessToken: string,
  maxResults: number,
  query: string = DEFAULT_GMAIL_QUERY
): Promise<GmailMessageSummary[]> {
  const listUrl = new URL(`${GMAIL_API}/users/me/messages`)
  listUrl.searchParams.set('maxResults', String(maxResults))
  listUrl.searchParams.set('q', query)

  const listRes = await fetch(listUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!listRes.ok) {
    const errText = await listRes.text()
    throw new Error(`Gmail list: ${listRes.status} ${errText.slice(0, 200)}`)
  }
  const listJson = (await listRes.json()) as ListResponse
  const ids = listJson.messages ?? []
  const out: GmailMessageSummary[] = []
  for (const m of ids) {
    const row = await fetchOneSummary(accessToken, m.id, m.threadId)
    if (row) out.push(row)
  }
  return out
}

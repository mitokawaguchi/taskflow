const CHATWORK_API = 'https://api.chatwork.com/v2'

export type PostChatworkMessageParams = {
  apiToken: string
  roomId: string
  body: string
}

/** Chatwork に 1 件投稿（POST /rooms/{id}/messages） */
export async function postChatworkMessage(params: PostChatworkMessageParams): Promise<void> {
  const url = `${CHATWORK_API}/rooms/${encodeURIComponent(params.roomId)}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-ChatWorkToken': params.apiToken,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams({ body: params.body }).toString(),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Chatwork API エラー (${res.status}): ${text.slice(0, 240)}`)
  }
}

/** Chatwork POST（Deno / Node 共通の fetch 想定） */
export async function postChatworkMessage(params: {
  apiToken: string
  roomId: string
  body: string
}): Promise<void> {
  const url = `https://api.chatwork.com/v2/rooms/${encodeURIComponent(params.roomId)}/messages`
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
    throw new Error(`Chatwork API (${res.status}): ${text.slice(0, 240)}`)
  }
}

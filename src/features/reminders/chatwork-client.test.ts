import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { postChatworkMessage } from './chatwork-client'

describe('postChatworkMessage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('正常系: X-ChatWorkToken と body を送る', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('{"message_id":"1"}', { status: 200 })
    )
    await postChatworkMessage({
      apiToken: 'token-test',
      roomId: 'room-1',
      body: 'hello',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    const call = vi.mocked(fetch).mock.calls[0]
    expect(call[0]).toContain('/rooms/room-1/messages')
    const init = call[1] as RequestInit
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({
      'X-ChatWorkToken': 'token-test',
    })
    expect(init?.body).toContain('hello')
  })

  it('異常系: 非 200 でエラー', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('ng', { status: 429 }))
    await expect(
      postChatworkMessage({ apiToken: 't', roomId: 'r', body: 'x' })
    ).rejects.toThrow(/429/)
  })

  it('0件メッセージでも呼び出しは可能（呼び出し側で抑止）', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }))
    await postChatworkMessage({ apiToken: 't', roomId: 'r', body: '' })
    expect(fetch).toHaveBeenCalled()
  })
})

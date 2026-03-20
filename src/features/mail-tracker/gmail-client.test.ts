import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchInboxMessageSummaries } from './gmail-client'

describe('fetchInboxMessageSummaries', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('list と各 message を叩いて一覧を組み立てる', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ messages: [{ id: 'm1', threadId: 'th1' }] }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'm1',
            threadId: 'th1',
            internalDate: '1710000000000',
            payload: {
              headers: [
                { name: 'From', value: 'a@b' },
                { name: 'Subject', value: 'Hello' },
              ],
            },
          }),
          { status: 200 }
        )
      )
    const rows = await fetchInboxMessageSummaries('token', 5)
    expect(rows).toHaveLength(1)
    expect(rows[0].subject).toBe('Hello')
    expect(rows[0].from).toBe('a@b')
  })

  it('list が失敗したら例外', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('err', { status: 401 }))
    await expect(fetchInboxMessageSummaries('bad', 5)).rejects.toThrow(/401/)
  })
})

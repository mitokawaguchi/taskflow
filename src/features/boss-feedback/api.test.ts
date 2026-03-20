import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()

const { getOwnerIdMock } = vi.hoisted(() => ({
  /** getOwnerId は未ログイン時 null を返しうる */
  getOwnerIdMock: vi.fn((): Promise<string | null> => Promise.resolve('user-1')),
}))

vi.mock('../../api/helpers', () => ({
  getOwnerId: () => getOwnerIdMock(),
  getSupabase: () => ({ from: mockFrom }),
  ensureCanDelete: vi.fn(() => Promise.resolve()),
}))

/** Supabase .single() の成功レスポンスを返す関数を生成 */
function makeSingleResolver<T extends Record<string, unknown>>(data: T) {
  return () => Promise.resolve({ data, error: null })
}

function chainSelectOrder(data: unknown[]) {
  const orderResult = Promise.resolve({ data, error: null })
  return {
    select: () => ({
      eq: () => ({
        order: () => orderResult,
      }),
    }),
  }
}

function chainInsertSingle(data: Record<string, unknown>) {
  const single = makeSingleResolver(data)
  return {
    insert: () => ({
      select: () => ({ single }),
    }),
  }
}

function chainUpdateSingle(data: Record<string, unknown>) {
  const single = makeSingleResolver(data)
  return {
    update: () => ({
      eq: () => ({
        select: () => ({ single }),
      }),
    }),
  }
}

function chainDelete() {
  const eqResult = Promise.resolve({ error: null })
  return {
    delete: () => ({
      eq: () => eqResult,
    }),
  }
}

describe('boss-feedback api', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFrom.mockReset()
    getOwnerIdMock.mockReset()
    getOwnerIdMock.mockResolvedValue('user-1')
  })

  it('fetchBossFeedback: 行をアプリ型にマッピングする', async () => {
    mockFrom.mockReturnValue(
      chainSelectOrder([
        {
          id: 'a1',
          created_at: '2025-01-01T00:00:00Z',
          category: '誤字',
          description: 'テスト',
          example_before: null,
          example_after: '修正',
          project_name: 'PJ-A',
          frequency: 3,
          memo: null,
        },
      ])
    )
    const { fetchBossFeedback } = await import('./api')
    const rows = await fetchBossFeedback()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      id: 'a1',
      category: '誤字',
      description: 'テスト',
      exampleAfter: '修正',
      projectName: 'PJ-A',
      frequency: 3,
    })
    expect(mockFrom).toHaveBeenCalledWith('boss_feedback')
  })

  it('fetchBossFeedback: owner が無いときは空配列', async () => {
    getOwnerIdMock.mockImplementationOnce(() => Promise.resolve(null))
    const { fetchBossFeedback } = await import('./api')
    const rows = await fetchBossFeedback()
    expect(rows).toEqual([])
  })

  it('insertBossFeedback: insert を呼ぶ', async () => {
    const row = {
      id: 'new-id',
      created_at: '2025-01-02T00:00:00Z',
      category: '表現',
      description: 'D',
      example_before: null,
      example_after: null,
      project_name: null,
      frequency: 1,
      memo: null,
    }
    mockFrom.mockReturnValue(chainInsertSingle(row))
    const { insertBossFeedback } = await import('./api')
    const result = await insertBossFeedback({
      id: 'new-id',
      category: '表現',
      description: 'D',
      exampleBefore: null,
      exampleAfter: null,
      projectName: null,
      frequency: 1,
      memo: null,
    })
    expect(result.description).toBe('D')
  })

  it('updateBossFeedback: 更新後の行を返す', async () => {
    const row = {
      id: 'x1',
      created_at: '2025-01-01T00:00:00Z',
      category: 'その他',
      description: '更新',
      example_before: null,
      example_after: null,
      project_name: null,
      frequency: 2,
      memo: 'メモ',
    }
    mockFrom.mockReturnValue(chainUpdateSingle(row))
    const { updateBossFeedback } = await import('./api')
    const result = await updateBossFeedback('x1', {
      category: 'その他',
      description: '更新',
      exampleBefore: null,
      exampleAfter: null,
      projectName: null,
      frequency: 2,
      memo: 'メモ',
    })
    expect(result.memo).toBe('メモ')
  })

  it('deleteBossFeedback: ensureCanDelete 後に delete する', async () => {
    mockFrom.mockReturnValue(chainDelete())
    const helpers = await import('../../api/helpers')
    const { deleteBossFeedback } = await import('./api')
    await deleteBossFeedback('d1')
    expect(helpers.ensureCanDelete).toHaveBeenCalledWith('boss_feedback', 'd1')
  })
})

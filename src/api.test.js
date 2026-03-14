import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}))

// Supabase の select().or().order().order() チェーンを再現（fetchProjects は .order().order() を使用）
function mockSelectOrder(data) {
  const promise = Promise.resolve({ data: data ?? [], error: null })
  const orderResult = {
    order: () => promise,
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
  }
  const chain = {
    or: function () {
      return this
    },
    order: () => orderResult,
  }
  return {
    select: () => chain,
  }
}

function mockInsertSingle(data) {
  return {
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data, error: null }),
      }),
    }),
  }
}

function mockUpdateSingle(data) {
  return {
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data, error: null }),
        }),
      }),
    }),
  }
}

describe('api', () => {
  beforeEach(async () => {
    vi.resetModules()
    const { supabase } = await import('./supabase')
    supabase.from.mockReturnValue(mockSelectOrder([]))
  })

  describe('fetchProjects', () => {
    it('returns empty array when no data', async () => {
      const { fetchProjects } = await import('./api')
      const result = await fetchProjects()
      expect(result).toEqual([])
    })
    it('maps rows to app shape', async () => {
      const { supabase } = await import('./supabase')
      const { fetchProjects } = await import('./api')
      supabase.from.mockReturnValue(
        mockSelectOrder([{ id: 'p1', name: 'Test', color: '#fff', icon: '📁' }])
      )
      const result = await fetchProjects()
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'p1', name: 'Test', color: '#fff', icon: '📁' })
      expect(result[0]).toHaveProperty('endDate', '')
      expect(result[0]).toHaveProperty('sortOrder', 0)
    })
    it('returns data when session has user (owner_id filter path)', async () => {
      const { supabase } = await import('./supabase')
      supabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      })
      supabase.from.mockReturnValue(
        mockSelectOrder([{ id: 'p1', name: 'My', color: '#333', icon: '📁' }])
      )
      const { fetchProjects } = await import('./api')
      const result = await fetchProjects()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('My')
      expect(supabase.from).toHaveBeenCalledWith('tf_projects')
    })
  })

  describe('fetchTasks', () => {
    it('returns empty array when no data', async () => {
      const { fetchTasks } = await import('./api')
      const result = await fetchTasks()
      expect(result).toEqual([])
    })
    it('maps project_id to projectId and created to number', async () => {
      const { supabase } = await import('./supabase')
      const { fetchTasks } = await import('./api')
      const row = {
        id: 't1',
        project_id: 'p1',
        title: 'Task',
        desc: 'd',
        priority: 'high',
        due: '2025-03-20',
        done: false,
        created: '12345',
      }
      supabase.from.mockReturnValue(mockSelectOrder([row]))
      const result = await fetchTasks()
      expect(result[0].projectId).toBe('p1')
      expect(result[0].title).toBe('Task')
      expect(result[0].created).toBe(12345)
    })
    it('maps status review and progress when in range (taskFromRow branches)', async () => {
      const { supabase } = await import('./supabase')
      const { fetchTasks } = await import('./api')
      const row = {
        id: 't2',
        project_id: 'p1',
        title: 'Review task',
        desc: '',
        priority: 'medium',
        due: null,
        done: false,
        status: 'review',
        progress: 50,
        created: 999,
      }
      supabase.from.mockReturnValue(mockSelectOrder([row]))
      const result = await fetchTasks()
      expect(result[0].status).toBe('review')
      expect(result[0].progress).toBe(50)
    })
    it('maps done true and status from row when status not in keys', async () => {
      const { supabase } = await import('./supabase')
      const { fetchTasks } = await import('./api')
      const row = {
        id: 't3',
        project_id: 'p1',
        title: 'Done task',
        desc: '',
        priority: 'low',
        due: null,
        done: true,
        status: 'custom',
        created: 1,
      }
      supabase.from.mockReturnValue(mockSelectOrder([row]))
      const result = await fetchTasks()
      expect(result[0].done).toBe(true)
      expect(result[0].status).toBe('done')
    })
  })

  describe('fetchTemplates', () => {
    it('returns empty array when no data', async () => {
      const { fetchTemplates } = await import('./api')
      const result = await fetchTemplates()
      expect(result).toEqual([])
    })
  })

  describe('fetchCategories', () => {
    it('returns empty array when no data', async () => {
      const { fetchCategories } = await import('./api')
      const result = await fetchCategories()
      expect(result).toEqual([])
    })
    it('maps rows to app shape (categoryFromRow)', async () => {
      const { supabase } = await import('./supabase')
      const { fetchCategories } = await import('./api')
      supabase.from.mockReturnValue(
        mockSelectOrder([{ id: 'cat1', name: 'Work', color: '#333' }])
      )
      const result = await fetchCategories()
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'cat1', name: 'Work', color: '#333' })
    })
  })

  describe('fetchUsers', () => {
    it('returns empty array when no data', async () => {
      const { fetchUsers } = await import('./api')
      const result = await fetchUsers()
      expect(result).toEqual([])
    })
    it('maps rows to app shape (userFromRow)', async () => {
      const { supabase } = await import('./supabase')
      const { fetchUsers } = await import('./api')
      supabase.from.mockReturnValue(
        mockSelectOrder([{ id: 'u1', name: 'Alice', email: 'a@b.co', avatar_url: null }])
      )
      const result = await fetchUsers()
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'u1', name: 'Alice', email: 'a@b.co' })
      expect(result[0]).toHaveProperty('avatarUrl', '')
    })
  })

  describe('fetchRemember', () => {
    it('returns empty array when no data', async () => {
      const { fetchRemember } = await import('./api')
      const result = await fetchRemember()
      expect(result).toEqual([])
    })
    it('maps rows to app shape (rememberFromRow)', async () => {
      const { supabase } = await import('./supabase')
      const { fetchRemember } = await import('./api')
      supabase.from.mockReturnValue(
        mockSelectOrder([{ id: 'r1', client_id: 'c1', body: 'Memo', created: 123 }])
      )
      const result = await fetchRemember()
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'r1', clientId: 'c1', body: 'Memo' })
      expect(result[0].created).toBe(123)
    })
  })

  describe('insertProject', () => {
    it('returns project in app shape', async () => {
      const { supabase } = await import('./supabase')
      const { insertProject } = await import('./api')
      const project = { id: 'p99', name: 'N', color: '#000', icon: '📂' }
      supabase.from.mockReturnValue(mockInsertSingle(project))
      const result = await insertProject(project)
      expect(result).toMatchObject(project)
      expect(result).toHaveProperty('endDate', '')
      expect(result).toHaveProperty('sortOrder', 0)
    })

    it('accepts and returns project with UUID-style id (CODE-003)', async () => {
      const { supabase } = await import('./supabase')
      const { insertProject } = await import('./api')
      const uuidId = `p-${crypto.randomUUID()}`
      const project = { id: uuidId, name: 'N', color: '#000', icon: '📂' }
      supabase.from.mockReturnValue(mockInsertSingle(project))
      const result = await insertProject(project)
      expect(result.id).toMatch(/^p-[0-9a-f-]{36}$/i)
      expect(result.name).toBe('N')
    })
  })

  describe('insertTask', () => {
    it('returns task with projectId', async () => {
      const { supabase } = await import('./supabase')
      const { insertTask } = await import('./api')
      const row = {
        id: 't1',
        project_id: 'p1',
        title: 'T',
        desc: '',
        priority: 'medium',
        due: null,
        done: false,
        created: 999,
      }
      supabase.from.mockReturnValue(mockInsertSingle(row))
      const result = await insertTask({
        id: 't1',
        projectId: 'p1',
        title: 'T',
        desc: '',
        priority: 'medium',
        due: null,
        done: false,
        created: 999,
      })
      expect(result.projectId).toBe('p1')
    })

    it('accepts and returns task with UUID-style id (CODE-003)', async () => {
      const { supabase } = await import('./supabase')
      const { insertTask } = await import('./api')
      const uuidId = `t-${crypto.randomUUID()}`
      const row = {
        id: uuidId,
        project_id: 'p1',
        title: 'T',
        desc: '',
        priority: 'medium',
        due: null,
        done: false,
        created: 999,
      }
      supabase.from.mockReturnValue(mockInsertSingle(row))
      const result = await insertTask({
        id: uuidId,
        projectId: 'p1',
        title: 'T',
        desc: '',
        priority: 'medium',
        due: null,
        done: false,
        created: 999,
      })
      expect(result.id).toMatch(/^t-[0-9a-f-]{36}$/i)
      expect(result.projectId).toBe('p1')
    })

    it('sets owner_id when session exists (TEST-002 / RLS)', async () => {
      const { supabase } = await import('./supabase')
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'owner-uuid-123' } } },
      })
      const insertSpy = vi.fn((row) => ({
        select: () => ({ single: () => Promise.resolve({ data: row, error: null }) }),
      }))
      supabase.from.mockReturnValue({ insert: insertSpy })
      const { insertTask } = await import('./api')
      await insertTask({
        id: 't1',
        projectId: 'p1',
        title: 'T',
        desc: '',
        priority: 'medium',
        due: null,
        done: false,
        created: 999,
      })
      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({ owner_id: 'owner-uuid-123' })
      )
    })

    it('does not set owner_id when session is null', async () => {
      const { supabase } = await import('./supabase')
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
      const insertSpy = vi.fn((row) => ({
        select: () => ({ single: () => Promise.resolve({ data: row, error: null }) }),
      }))
      supabase.from.mockReturnValue({ insert: insertSpy })
      const { insertTask } = await import('./api')
      await insertTask({
        id: 't1',
        projectId: 'p1',
        title: 'T',
        desc: '',
        priority: 'medium',
        due: null,
        done: false,
        created: 999,
      })
      const call = insertSpy.mock.calls[0][0]
      expect(call).not.toHaveProperty('owner_id')
    })
  })

  describe('updateTask', () => {
    it('returns updated task in app shape', async () => {
      const { supabase } = await import('./supabase')
      const { updateTask } = await import('./api')
      const updated = {
        id: 't1',
        project_id: 'p2',
        title: 'Updated',
        desc: '',
        priority: 'medium',
        due: null,
        done: true,
        created: 111,
      }
      supabase.from.mockReturnValue(mockUpdateSingle(updated))
      const result = await updateTask('t1', { done: true })
      expect(result.projectId).toBe('p2')
      expect(result.done).toBe(true)
    })
  })

  describe('insertTemplate', () => {
    it('returns template in app shape', async () => {
      const { supabase } = await import('./supabase')
      const { insertTemplate } = await import('./api')
      const template = { id: 'tpl1', title: 'Tpl', desc: '', priority: 'low' }
      supabase.from.mockReturnValue(mockInsertSingle(template))
      const result = await insertTemplate(template)
      expect(result).toEqual(template)
    })
  })

  describe('updateTemplate', () => {
    it('returns updated template', async () => {
      const { supabase } = await import('./supabase')
      const { updateTemplate } = await import('./api')
      const updated = { id: 'tpl1', title: 'Updated', desc: 'd', priority: 'high' }
      supabase.from.mockReturnValue(mockUpdateSingle(updated))
      const result = await updateTemplate('tpl1', { title: 'Updated', desc: 'd', priority: 'high' })
      expect(result).toMatchObject({ id: 'tpl1', title: 'Updated', priority: 'high' })
    })
  })

  describe('deleteTemplate', () => {
    it('does not throw when owner matches or null (SEC-005)', async () => {
      const { supabase } = await import('./supabase')
      supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'me' } } } })
      supabase.from.mockImplementation((table) => {
        if (table === 'tf_templates') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { owner_id: 'me' }, error: null }),
              }),
            }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
          }
        }
        return mockSelectOrder([])
      })
      const { deleteTemplate } = await import('./api')
      await expect(deleteTemplate('tpl1')).resolves.toBeUndefined()
    })
    it('throws when owner does not match (SEC-005)', async () => {
      const { supabase } = await import('./supabase')
      supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'me' } } } })
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: { owner_id: 'other-user' }, error: null }),
          }),
        }),
      })
      const { deleteTemplate } = await import('./api')
      await expect(deleteTemplate('tpl1')).rejects.toThrow('権限がありません')
    })
  })

  describe('updateClient', () => {
    it('returns updated client', async () => {
      const { supabase } = await import('./supabase')
      const { updateClient } = await import('./api')
      const updated = { id: 'c1', name: 'Client A', color: '#333', icon: '🤝' }
      supabase.from.mockReturnValue(mockUpdateSingle(updated))
      const result = await updateClient('c1', { name: 'Client A', color: '#333', icon: '🤝' })
      expect(result).toMatchObject({ id: 'c1', name: 'Client A' })
    })
  })

  describe('deleteClient', () => {
    it('does not throw', async () => {
      const { supabase } = await import('./supabase')
      supabase.from.mockReturnValue({
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      })
      const { deleteClient } = await import('./api')
      await expect(deleteClient('c1')).resolves.toBeUndefined()
    })
  })

  describe('claimExistingDataToAccount', () => {
    it('throws (deprecated SEC-002)', async () => {
      const { claimExistingDataToAccount } = await import('./api')
      await expect(claimExistingDataToAccount()).rejects.toThrow('廃止されています')
    })
  })

  describe('getAuthSession (根幹)', () => {
    it('returns null when getSession throws', async () => {
      const { supabase } = await import('./supabase')
      supabase.auth.getSession.mockRejectedValueOnce(new Error('Network error'))
      const { getAuthSession } = await import('./api')
      const session = await getAuthSession()
      expect(session).toBeNull()
    })
    it('returns session when getSession resolves', async () => {
      const { supabase } = await import('./supabase')
      const mockSession = { user: { id: 'u1', email: 'a@b.co' } }
      supabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession } })
      const { getAuthSession } = await import('./api')
      const session = await getAuthSession()
      expect(session).toEqual(mockSession)
    })
  })

  describe('insertTask / updateTask 必須チェック (根幹)', () => {
    it('insertTask throws when task has no title', async () => {
      const { insertTask } = await import('./api')
      await expect(insertTask(null)).rejects.toThrow('タスク名は必須です')
      await expect(insertTask({ id: 't1', projectId: 'p1' })).rejects.toThrow('タスク名は必須です')
    })
    it('insertTask throws when title exceeds VALIDATION.taskTitle (SEC-004)', async () => {
      const { insertTask } = await import('./api')
      const { VALIDATION } = await import('./constants')
      const longTitle = 'x'.repeat(VALIDATION.taskTitle + 1)
      await expect(
        insertTask({ id: 't1', projectId: 'p1', title: longTitle, desc: '', priority: 'medium', due: null, done: false, created: 1 })
      ).rejects.toThrow('文字以内にしてください')
    })
    it('updateTask throws when id or patch invalid', async () => {
      const { updateTask } = await import('./api')
      await expect(updateTask('', { title: 'x' })).rejects.toThrow('更新パラメータが不正です')
      await expect(updateTask('t1', null)).rejects.toThrow('更新パラメータが不正です')
    })
  })

  describe('SEC-004 入力長チェック', () => {
    it('insertProject throws when name exceeds VALIDATION.projectName', async () => {
      const { insertProject } = await import('./api')
      const { VALIDATION } = await import('./constants')
      const longName = 'x'.repeat(VALIDATION.projectName + 1)
      await expect(
        insertProject({ id: 'p1', name: longName, color: '#000', icon: '📁' })
      ).rejects.toThrow('文字にしてください')
    })
  })

  describe('SEC-005 ensureCanDelete', () => {
    it('deleteTemplate throws when row not found', async () => {
      const { supabase } = await import('./supabase')
      supabase.from.mockReturnValue({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) }) }),
      })
      const { deleteTemplate } = await import('./api')
      await expect(deleteTemplate('nonexistent')).rejects.toThrow('削除対象が見つかりません')
    })
  })
})

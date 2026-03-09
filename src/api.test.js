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
  })

  describe('fetchTemplates', () => {
    it('returns empty array when no data', async () => {
      const { fetchTemplates } = await import('./api')
      const result = await fetchTemplates()
      expect(result).toEqual([])
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

  describe('claimExistingDataToAccount', () => {
    it('throws (deprecated SEC-002)', async () => {
      const { claimExistingDataToAccount } = await import('./api')
      await expect(claimExistingDataToAccount()).rejects.toThrow('廃止されています')
    })
  })
})

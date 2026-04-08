import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteBossFeedback,
  fetchBossFeedback,
  insertBossFeedback,
  updateBossFeedback,
} from './api'
import {
  filterBossFeedbackByCategory,
  filterBossFeedbackByDescription,
  sortBossFeedbackByFrequency,
} from './bossFeedbackFilters'
import type { BossFeedback, BossFeedbackFormValues } from './types'
import { validateBossFeedbackForm } from './validation'

type AddToast = (icon: string, title: string, msg: string) => void

function defaultForm(): BossFeedbackFormValues {
  return {
    category: 'その他',
    description: '',
    purpose: '',
    exampleBefore: '',
    exampleAfter: '',
    projectName: '',
    frequency: 1,
    memo: '',
  }
}

/** 一覧・フィルタ・フォーム・CRUD をまとめた画面用フック */
export function useBossFeedback(addToast: AddToast) {
  const [items, setItems] = useState<BossFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BossFeedbackFormValues>(defaultForm)
  const [filters, setFilters] = useState({
    category: 'all' as string,
    sortFrequencyDesc: true,
    searchQuery: '',
  })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await fetchBossFeedback()
      setItems(rows)
    } catch (e) {
      console.error(e)
      addToast('❌', '読み込み失敗', e instanceof Error ? e.message : '一覧を取得できませんでした')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    void load()
  }, [load])

  const displayed = useMemo(() => {
    let list = filterBossFeedbackByCategory(items, filters.category)
    list = filterBossFeedbackByDescription(list, filters.searchQuery)
    list = sortBossFeedbackByFrequency(list, filters.sortFrequencyDesc)
    return list
  }, [items, filters])

  const resetForm = useCallback(() => {
    setForm(defaultForm())
    setEditingId(null)
  }, [])

  const startEdit = useCallback((row: BossFeedback) => {
    setEditingId(row.id)
    setForm({
      category: row.category,
      description: row.description,
      purpose: row.purpose,
      exampleBefore: row.exampleBefore ?? '',
      exampleAfter: row.exampleAfter ?? '',
      projectName: row.projectName ?? '',
      frequency: row.frequency,
      memo: row.memo ?? '',
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    const checked = validateBossFeedbackForm(form)
    if (!checked.ok) {
      addToast('⚠️', '入力エラー', checked.error)
      return
    }
    const v = checked.values
    const payload = {
      category: v.category,
      description: v.description,
      purpose: v.purpose,
      exampleBefore: v.exampleBefore || null,
      exampleAfter: v.exampleAfter || null,
      projectName: v.projectName || null,
      frequency: v.frequency,
      memo: v.memo || null,
    }
    try {
      if (editingId) {
        await updateBossFeedback(editingId, payload)
        addToast('✅', '保存しました', '指摘を更新しました')
      } else {
        await insertBossFeedback({ id: crypto.randomUUID(), ...payload })
        addToast('✅', '保存しました', '指摘を追加しました')
      }
      resetForm()
      await load()
    } catch (e) {
      console.error(e)
      addToast('❌', '保存失敗', e instanceof Error ? e.message : '保存できませんでした')
    }
  }, [addToast, editingId, form, load, resetForm])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!globalThis.confirm('この指摘を削除しますか？')) return
      try {
        await deleteBossFeedback(id)
        addToast('🗑️', '削除しました', '')
        if (editingId === id) resetForm()
        await load()
      } catch (e) {
        console.error(e)
        addToast('❌', '削除失敗', e instanceof Error ? e.message : '削除できませんでした')
      }
    },
    [addToast, editingId, load, resetForm]
  )

  const updateField = useCallback(<K extends keyof BossFeedbackFormValues>(key: K, value: BossFeedbackFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  return {
    loading,
    items: displayed,
    filters,
    setFilters,
    form,
    updateField,
    editingId,
    startEdit,
    resetForm,
    handleSubmit,
    handleDelete,
    reload: load,
  }
}

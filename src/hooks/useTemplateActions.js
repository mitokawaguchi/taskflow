import { useCallback } from 'react'
import { insertTemplate, updateTemplate, deleteTemplate } from '../api'

/** テンプレートの保存・削除を集約。ARCH-001 */
export function useTemplateActions(setTemplates, addToast, setShowTplForm, setEditTemplate) {
  const saveTemplate = useCallback(
    async (form) => {
      try {
        if (form.id) {
          const updated = await updateTemplate(form.id, form)
          setTemplates((ts) => ts.map((t) => (t.id === updated.id ? updated : t)))
          addToast('📋', 'テンプレートを更新しました', form.title)
        } else {
          const template = { ...form, id: `tpl-${crypto.randomUUID()}` }
          const created = await insertTemplate(template)
          setTemplates((ts) => [...ts, created])
          addToast('📋', 'テンプレートを保存しました', form.title)
        }
        setShowTplForm(false)
        setEditTemplate(null)
      } catch (e) {
        addToast('❌', '保存できませんでした', e?.message ?? '')
      }
    },
    [addToast, setShowTplForm, setEditTemplate]
  )

  const removeTemplate = useCallback(
    async (id) => {
      try {
        await deleteTemplate(id)
        setTemplates((ts) => ts.filter((t) => t.id !== id))
        setShowTplForm(false)
        setEditTemplate(null)
        addToast('📋', 'テンプレートを削除しました', '')
      } catch (e) {
        addToast('❌', '削除できませんでした', e?.message ?? '')
      }
    },
    [addToast, setShowTplForm, setEditTemplate]
  )

  return { saveTemplate, removeTemplate }
}

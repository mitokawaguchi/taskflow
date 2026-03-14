import { useCallback } from 'react'
import { insertClient, updateClient, deleteClient, insertRemember, updateRemember, deleteRemember } from '../api'
import { VALIDATION, truncateToMax } from '../constants'

/** クライアント・覚えておくことの CRUD を集約。ARCH-001 */
export function useClientActions(
  remembers,
  setClients,
  setRemembers,
  addToast,
  setShowClientForm,
  setEditClient,
  locationPathname,
  navigate
) {
  const saveClient = useCallback(
    async (form) => {
      try {
        if (form.id) {
          const updated = await updateClient(form.id, form)
          setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
          addToast('🤝', 'クライアントを更新しました', form.name)
        } else {
          const client = { ...form, id: `c-${crypto.randomUUID()}` }
          const created = await insertClient(client)
          setClients((prev) => [...prev, created])
          addToast('🤝', 'クライアントを追加しました', form.name)
        }
        setShowClientForm(false)
        setEditClient(null)
      } catch (e) {
        addToast('❌', '追加できませんでした', e?.message ?? '')
      }
    },
    [addToast, setShowClientForm, setEditClient]
  )

  const removeClient = useCallback(
    async (id) => {
      try {
        const clientRemembers = remembers.filter((r) => r.clientId === id)
        for (const r of clientRemembers) {
          await deleteRemember(r.id)
        }
        await deleteClient(id)
        setRemembers((prev) => prev.filter((r) => r.clientId !== id))
        setClients((prev) => prev.filter((c) => c.id !== id))
        setShowClientForm(false)
        setEditClient(null)
        if (locationPathname === `/clients/${id}`) navigate('/clients')
        addToast('🤝', 'クライアントを削除しました', '')
      } catch (e) {
        addToast('❌', '削除できませんでした', e?.message ?? '')
      }
    },
    [addToast, remembers, locationPathname, navigate, setShowClientForm, setEditClient]
  )

  const addRemember = useCallback(
    async (clientId, body) => {
      if (!body?.trim()) return
      try {
        const item = {
          id: `rem-${crypto.randomUUID()}`,
          clientId,
          body: truncateToMax(body, VALIDATION.rememberBody),
          created: Date.now(),
        }
        const created = await insertRemember(item)
        setRemembers((prev) => [created, ...prev])
        addToast('📌', '覚えておくことを追加しました', '')
      } catch (e) {
        addToast('❌', '追加できませんでした', e?.message ?? '')
      }
    },
    [addToast]
  )

  const updateRememberItem = useCallback(
    async (id, body) => {
      if (!body?.trim()) return
      try {
        const updated = await updateRemember(id, { body: truncateToMax(body, VALIDATION.rememberBody) })
        setRemembers((prev) => prev.map((r) => (r.id === id ? updated : r)))
        addToast('✏️', '更新しました', '')
      } catch (e) {
        addToast('❌', '更新できませんでした', e?.message ?? '')
      }
    },
    [addToast]
  )

  const removeRemember = useCallback(
    async (id) => {
      try {
        await deleteRemember(id)
        setRemembers((prev) => prev.filter((r) => r.id !== id))
        addToast('🗑️', '削除しました', '')
      } catch (e) {
        addToast('❌', '削除できませんでした', e?.message ?? '')
      }
    },
    [addToast]
  )

  return { saveClient, removeClient, addRemember, updateRememberItem, removeRemember }
}

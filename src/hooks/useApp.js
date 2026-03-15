/**
 * ARCH-001: App.jsx 200行以下化のため useAppUI + useAppData + useAppHandlers を統合
 */
import { useAuth } from './useAuth'
import { useAppUI } from './useAppUI'
import { useAppData } from './useAppData'
import { useAppHandlers } from './useAppHandlers'

export function useApp() {
  const auth = useAuth()
  const ui = useAppUI()
  const data = useAppData(auth.authUser, ui.addToast)
  const handlers = useAppHandlers(data, ui, auth.authUser)
  return {
    ...auth,
    ...data,
    ...ui,
    ...handlers,
  }
}

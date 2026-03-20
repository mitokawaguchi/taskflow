import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { buildGmailOAuthUrl } from './gmail-auth'
import { filterByTab, mergeInboxRowsOldestFirst } from './inbox-merge'
import type { InboxTab } from './chatwork-unread-types'
import { MailTrackerGmailTokenPanel } from './MailTrackerGmailTokenPanel'
import { MailTrackerList } from './MailTrackerList'
import { useChatworkUnread } from './useChatworkUnread'
import { useMailTracker } from './hooks'

type Props = {
  addToast: (icon: string, title: string, msg: string) => void
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined

/** Gmail + Chatwork 未返信（メールは開発用トークン、CW は Edge） */
export default function MailTrackerScreen({ addToast }: Readonly<Props>) {
  const { authUser } = useAuth()
  const [tab, setTab] = useState<InboxTab>('all')
  const mt = useMailTracker(addToast)
  const cw = useChatworkUnread(addToast, authUser?.id)

  const oauthUrl = useMemo(() => {
    if (!clientId || !redirectUri) return null
    try {
      return buildGmailOAuthUrl(clientId, redirectUri)
    } catch {
      return null
    }
  }, [])

  const merged = useMemo(
    () => mergeInboxRowsOldestFirst(mt.items, cw.items),
    [mt.items, cw.items],
  )
  const rows = useMemo(() => filterByTab(merged, tab), [merged, tab])

  const handleRefresh = useCallback(() => {
    void Promise.all([mt.reload(), cw.reload()])
  }, [mt.reload, cw.reload])

  return (
    <div className="bf-screen">
      <p className="text-muted bf-lead">
        Gmail は API で未返信候補を一覧します。Chatwork は To メンション宛で自分がまだ返信していないスレッドを、最大
        15 ルームまで Edge Function 経由で取得します。
      </p>
      <MailTrackerGmailTokenPanel oauthUrl={oauthUrl} token={mt.token} onTokenChange={mt.saveToken} />
      <MailTrackerList
        tab={tab}
        onTabChange={setTab}
        rows={rows}
        counts={{ mail: mt.items.length, chatwork: cw.items.length }}
        loadingMail={mt.loading}
        loadingChatwork={cw.loading}
        onRefresh={handleRefresh}
      />
    </div>
  )
}

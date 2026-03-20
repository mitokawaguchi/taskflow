import { useMemo } from 'react'
import { buildGmailOAuthUrl } from './gmail-auth'
import { MailTrackerList } from './MailTrackerList'
import { useMailTracker } from './hooks'

type Props = {
  addToast: (icon: string, title: string, msg: string) => void
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined

/** Gmail 未返信トラッカー画面（トークンは OAuth 後に別途保存する想定／開発は sessionStorage） */
export default function MailTrackerScreen({ addToast }: Readonly<Props>) {
  const mt = useMailTracker(addToast)

  const oauthUrl = useMemo(() => {
    if (!clientId || !redirectUri) return null
    try {
      return buildGmailOAuthUrl(clientId, redirectUri)
    } catch {
      return null
    }
  }, [])

  return (
    <div className="bf-screen">
      <p className="text-muted bf-lead">
        Gmail API で未返信候補を一覧します。トークンはブラウザの sessionStorage にのみ保持します（本番は Edge
        Function で安全に扱うことを推奨）。
      </p>
      <section className="bf-section">
        <h2 className="bf-heading">アクセストークン</h2>
        <p className="text-muted mt-p">
          OAuth の code→token 交換はクライアントに client_secret を置けないため、本番では Supabase Edge
          Function を用意してください。開発時は Google OAuth ツール等で取得した短期トークンを貼り付け可能です。
        </p>
        {oauthUrl && (
          <p className="mt-p">
            <a className="mt-link" href={oauthUrl} target="_blank" rel="noopener noreferrer">
              Google で認証（同意画面を開く）
            </a>
          </p>
        )}
        <label className="bf-field bf-field--block">
          <span className="bf-label">アクセストークン（開発用）</span>
          <input
            type="password"
            className="input"
            autoComplete="off"
            value={mt.token}
            onChange={(e) => mt.saveToken(e.target.value)}
            placeholder="ya29..."
          />
        </label>
      </section>
      <MailTrackerList loading={mt.loading} items={mt.items} onRefresh={mt.reload} />
    </div>
  )
}

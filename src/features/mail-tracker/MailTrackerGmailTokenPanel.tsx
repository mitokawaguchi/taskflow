type Props = {
  oauthUrl: string | null
  token: string
  onTokenChange: (value: string) => void
}

/** Gmail 用トークン入力（開発向け） */
export function MailTrackerGmailTokenPanel({ oauthUrl, token, onTokenChange }: Readonly<Props>) {
  return (
    <section className="bf-section">
      <h2 className="bf-heading">Gmail アクセストークン</h2>
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
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="ya29..."
        />
      </label>
    </section>
  )
}

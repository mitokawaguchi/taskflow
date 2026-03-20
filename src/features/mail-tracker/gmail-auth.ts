const GMAIL_READONLY = 'https://www.googleapis.com/auth/gmail.readonly'

/**
 * OAuth 同意画面へ飛ばす URL を組み立てる。
 * clientId / redirectUri は環境変数（VITE_）から渡す。
 */
export function buildGmailOAuthUrl(clientId: string, redirectUri: string): string {
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_READONLY,
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`
}

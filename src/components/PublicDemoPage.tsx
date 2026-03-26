import { LegalLinks } from './LegalLinks'

type PublicDemoPageProps = {
  /** 例: https://github.com/yourname/taskflow（未設定なら非表示） */
  readonly repositoryUrl?: string
}

/** About 用の公開デモ。ログイン・新規登録は出さない */
export function PublicDemoPage({ repositoryUrl }: PublicDemoPageProps) {
  const repo = repositoryUrl?.trim() ?? ''

  return (
    <div className="app login-screen">
      <div className="login-screen__inner">
        <div className="login-screen__brand">
          <img
            src="/logo.png"
            alt=""
            className="logo-icon"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/logo.svg'
            }}
          />
          <h1 className="login-screen__title">
            Task<span>Flow</span>
          </h1>
          <p className="login-screen__lead">公開デモ（閲覧のみ）</p>
        </div>
        <div className="login-screen__form public-demo-page__body">
          <p className="text-muted public-demo-page__text">
            この URL はリポジトリ紹介用です。ログイン・新規登録はできません。
          </p>
          <p className="text-muted public-demo-page__text">
            業務利用は別 URL のデプロイを利用してください（ブックマーク推奨）。
          </p>
          {repo.length > 0 && (
            <p className="public-demo-page__actions">
              <a className="btn btn-primary" href={repo} rel="noopener noreferrer" target="_blank">
                ソースコード（GitHub）
              </a>
            </p>
          )}
        </div>
        <footer className="login-screen__footer">
          <LegalLinks />
        </footer>
      </div>
    </div>
  )
}

import { ProfileLoginForm } from './ProfileLoginForm'
import { LegalLinks } from './LegalLinks'

/** 未ログイン時のみ表示するフル画面のログイン画面 */
export default function LoginScreen({ onError }) {
  return (
    <div className="app login-screen">
      <div className="login-screen__inner">
        <div className="login-screen__brand">
          <img
            src="/logo.png"
            alt=""
            className="logo-icon"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = '/logo.svg'
            }}
          />
          <h1 className="login-screen__title">
            Task<span>Flow</span>
          </h1>
          <p className="login-screen__lead">ログインしてタスクを管理</p>
        </div>
        <div className="login-screen__form">
          <ProfileLoginForm onSuccess={() => {}} onError={onError} showCloseButton={false} />
        </div>
        <footer className="login-screen__footer">
          <LegalLinks />
        </footer>
      </div>
    </div>
  )
}

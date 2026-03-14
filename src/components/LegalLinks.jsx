export function LegalLinks({ className = '' }) {
  const go = (hash) => {
    if (typeof window !== 'undefined') window.location.hash = hash
  }
  return (
    <nav className={`legal-links ${className}`} aria-label="法定ページ">
      <button type="button" className="legal-links__link" onClick={() => go('#/terms')}>
        利用規約
      </button>
      <span className="legal-links__sep">|</span>
      <button type="button" className="legal-links__link" onClick={() => go('#/privacy')}>
        プライバシーポリシー
      </button>
      <span className="legal-links__sep">|</span>
      <button type="button" className="legal-links__link" onClick={() => go('#/disclaimer')}>
        免責事項
      </button>
    </nav>
  )
}

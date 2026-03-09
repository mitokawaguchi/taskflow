import { LEGAL_PAGES } from '../legalContent'

/**
 * 法定ページ（利用規約・プライバシーポリシー・免責事項）のフル画面表示
 */
export default function LegalPageView({ pageKey, onBack }) {
  const page = LEGAL_PAGES[pageKey]
  if (!page) return null
  return (
    <div className="app legal-page">
      <div className="legal-page__inner">
        <button type="button" className="btn btn-ghost btn-sm legal-page__back" onClick={onBack}>
          ← 戻る
        </button>
        <h1 className="legal-page__title">{page.title}</h1>
        <div className="legal-page__body">
          {page.sections.map((sec, i) => (
            <section key={i}>
              <h2 className="legal-page__heading">{sec.heading}</h2>
              {sec.paragraphs.map((p, j) => (
                <p key={j} className="legal-page__p">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMaterialById, MATERIALS } from '../../data/materials'
import { getMaterialIdFromPath } from './materialsPath'

type AddModalProps = {
  onClose: () => void
}

function MaterialsAddModal({ onClose }: Readonly<AddModalProps>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="materials-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="materials-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="materials-add-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="materials-add-title" className="materials-modal__title">
          教材を追加する
        </h2>
        <p className="materials-modal__p">
          リポジトリに PDF を追加し、登録データを更新してください。アプリ上のこのボタンからファイルアップロードは行えません（静的ホスト向け）。
        </p>
        <ol className="materials-modal__ol">
          <li>
            <code className="materials-modal__code">public/materials/</code> に PDF を配置する
          </li>
          <li>
            <code className="materials-modal__code">src/data/materials.ts</code> の{' '}
            <code className="materials-modal__code">MATERIALS</code> に 1 件追加する
          </li>
          <li>ビルド・デプロイ後、サイドバー「教材集」から参照できる</li>
        </ol>
        <div className="materials-modal__actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

/** 教材集：左リスト・右 PDF（iframe） */
export default function MaterialsLibraryPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [addOpen, setAddOpen] = useState(false)

  const materialId = getMaterialIdFromPath(pathname)

  useEffect(() => {
    const normalized = pathname.replace(/\/$/, '') || '/'
    if (normalized === '/materials' && MATERIALS.length > 0) {
      navigate(`/materials/${MATERIALS[0].id}`, { replace: true })
    }
  }, [pathname, navigate])

  const current = materialId ? getMaterialById(materialId) : undefined

  return (
    <div className="materials-library">
      <aside className="materials-library__aside" aria-label="教材一覧">
        <div className="materials-library__aside-head">
          <h2 className="materials-library__heading">教材集</h2>
          <p className="materials-library__sub">サイト内で PDF を閲覧できます</p>
        </div>
        <ul className="materials-library__list">
          {MATERIALS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`materials-library__item ${materialId === m.id ? 'materials-library__item--active' : ''}`}
                onClick={() => navigate(`/materials/${m.id}`)}
              >
                <span className="materials-library__series">{m.seriesLabel}</span>
                <span className="materials-library__doc-title">{m.title}</span>
                <span className="materials-library__file">{m.fileLabel}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="materials-library__aside-foot">
          <button type="button" className="btn btn-primary materials-library__add" onClick={() => setAddOpen(true)}>
            + 教材を追加
          </button>
        </div>
      </aside>
      <section className="materials-library__viewer" aria-label="PDF 表示">
        {materialId && !current && (
          <div className="materials-library__empty">
            <p>この教材は見つかりませんでした。</p>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/materials')}>
              教材一覧へ
            </button>
          </div>
        )}
        {current && (
          <>
            <div className="materials-library__viewer-bar">
              <span className="materials-library__viewer-title">{current.title}</span>
              <a
                className="btn btn-ghost btn-sm"
                href={current.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                新しいタブで開く
              </a>
            </div>
            <iframe
              className="materials-library__iframe"
              title={`${current.title} の PDF`}
              src={current.pdfPath}
            />
          </>
        )}
      </section>
      {addOpen && <MaterialsAddModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}

import { useState, useCallback } from 'react'
import { insertCategory, fetchCategories } from '../api'
import ColorSwatchPicker from './ColorSwatchPicker'

export default function CategoriesView({ categories, setCategories, addToast }) {
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#6b7280')
  const [adding, setAdding] = useState(false)

  const handleAddCategory = useCallback(async () => {
    const name = newCatName.trim()
    if (!name) return
    setAdding(true)
    try {
      await insertCategory({
        id: `cat-${crypto.randomUUID()}`,
        name,
        color: newCatColor,
      })
      const list = await fetchCategories()
      setCategories(list)
      setNewCatName('')
      setNewCatColor('#6b7280')
      addToast('✅', 'カテゴリを追加しました', name)
    } catch (e) {
      addToast('❌', '追加できませんでした', e?.message ?? 'Supabase の設定または tf_categories テーブルを確認してください')
    } finally {
      setAdding(false)
    }
  }, [newCatName, newCatColor, setCategories, addToast])

  return (
    <div className="categories-view">
      <p className="categories-view__lead">タスクに付けるカテゴリを追加・管理します。</p>
      <ul className="settings-category-list categories-view__list" aria-label="登録済みカテゴリ">
        {categories.length === 0 ? (
          <li className="settings-category-empty">カテゴリがありません。下のフォームで追加してください。</li>
        ) : (
          categories.map((c) => (
            <li key={c.id} className="settings-category-item">
              <span className="settings-category-dot" style={{ background: c.color }} aria-hidden />
              <span>{c.name}</span>
            </li>
          ))
        )}
      </ul>
      <div className="categories-view__add">
        <div className="form-group">
          <label className="form-label" htmlFor="cat-name">
            新しいカテゴリ名
          </label>
          <input
            id="cat-name"
            type="text"
            className="form-input"
            placeholder="カテゴリ名"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            disabled={adding}
          />
        </div>
        <div className="form-group">
          <span className="form-label">色</span>
          <ColorSwatchPicker value={newCatColor} onChange={setNewCatColor} ariaLabel="カテゴリの色" />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddCategory}
          disabled={adding || !newCatName.trim()}
        >
          {adding ? '追加中…' : '追加'}
        </button>
      </div>
    </div>
  )
}

import type { BossFeedback } from './types'

type FiltersState = {
  category: string
  sortFrequencyDesc: boolean
  searchQuery: string
}

type Props = {
  loading: boolean
  items: BossFeedback[]
  filters: FiltersState
  onFiltersChange: (next: FiltersState) => void
  onEdit: (row: BossFeedback) => void
  onDelete: (id: string) => void
}

/** 指摘一覧（テーブル・カテゴリ・検索・frequency ソート） */
export function BossFeedbackList({
  loading,
  items,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
}: Readonly<Props>) {
  return (
    <section className="bf-section" aria-labelledby="bf-list-heading">
      <h2 id="bf-list-heading" className="bf-heading">
        指摘一覧
        {loading && <span className="text-muted">（読み込み中…）</span>}
      </h2>

      <div className="bf-toolbar">
        <label className="bf-field">
          <span className="bf-label">カテゴリ</span>
          <select
            className="input"
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
          >
            <option value="all">すべて</option>
            <option value="誤字">誤字</option>
            <option value="表現">表現</option>
            <option value="内容の精度">内容の精度</option>
            <option value="フォーマット">フォーマット</option>
            <option value="その他">その他</option>
          </select>
        </label>
        <label className="bf-field bf-field--grow">
          <span className="bf-label">説明で検索</span>
          <input
            type="search"
            className="input"
            placeholder="指摘内容の一部で検索"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            aria-label="指摘の説明で検索"
          />
        </label>
        <label className="bf-field bf-field--checkbox">
          <input
            type="checkbox"
            checked={filters.sortFrequencyDesc}
            onChange={(e) =>
              onFiltersChange({ ...filters, sortFrequencyDesc: e.target.checked })
            }
          />
          <span>回数の多い順（オフで少ない順）</span>
        </label>
      </div>

      {!loading && items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>該当する指摘がありません</p>
        </div>
      ) : (
        <div className="bf-table-wrap">
          <table className="bf-table">
            <thead>
              <tr>
                <th>カテゴリ</th>
                <th>指摘内容</th>
                <th>回数</th>
                <th>PJ</th>
                <th>作成日</th>
                <th aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{row.category}</td>
                  <td className="bf-table__desc">{row.description}</td>
                  <td>{row.frequency}</td>
                  <td>{row.projectName ?? '—'}</td>
                  <td>{row.createdAt.slice(0, 10)}</td>
                  <td className="bf-table__actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(row)}>
                      編集
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDelete(row.id)}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

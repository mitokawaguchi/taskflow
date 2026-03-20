import { BOSS_FEEDBACK_CATEGORIES, type BossFeedbackFormValues } from './types'

type Props = {
  form: BossFeedbackFormValues
  editingId: string | null
  onFieldChange: <K extends keyof BossFeedbackFormValues>(
    key: K,
    value: BossFeedbackFormValues[K]
  ) => void
  onSubmit: () => void
  onCancel: () => void
}

/** 指摘の追加・編集フォーム */
export function BossFeedbackForm({ form, editingId, onFieldChange, onSubmit, onCancel }: Readonly<Props>) {
  const title = editingId ? '指摘を編集' : '指摘を追加'

  return (
    <section id="boss-feedback-form" className="bf-section bf-form-section" aria-labelledby="bf-form-heading">
      <h2 id="bf-form-heading" className="bf-heading">
        {title}
      </h2>
      <form
        className="bf-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <label className="bf-field bf-field--block">
          <span className="bf-label">カテゴリ</span>
          <select
            className="input"
            value={form.category}
            onChange={(e) =>
              onFieldChange('category', e.target.value as BossFeedbackFormValues['category'])
            }
          >
            {BOSS_FEEDBACK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="bf-field bf-field--block">
          <span className="bf-label">指摘内容（必須）</span>
          <textarea
            className="input textarea"
            rows={3}
            value={form.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            required
          />
        </label>
        <div className="bf-form-row">
          <label className="bf-field bf-field--block">
            <span className="bf-label">修正前の例</span>
            <textarea
              className="input textarea"
              rows={2}
              value={form.exampleBefore}
              onChange={(e) => onFieldChange('exampleBefore', e.target.value)}
            />
          </label>
          <label className="bf-field bf-field--block">
            <span className="bf-label">修正後の例</span>
            <textarea
              className="input textarea"
              rows={2}
              value={form.exampleAfter}
              onChange={(e) => onFieldChange('exampleAfter', e.target.value)}
            />
          </label>
        </div>
        <label className="bf-field bf-field--block">
          <span className="bf-label">プロジェクト名</span>
          <input
            type="text"
            className="input"
            value={form.projectName}
            onChange={(e) => onFieldChange('projectName', e.target.value)}
          />
        </label>
        <label className="bf-field bf-field--block">
          <span className="bf-label">同じ指摘の回数（1 以上の整数）</span>
          <input
            type="number"
            className="input"
            min={1}
            step={1}
            value={form.frequency}
            onChange={(e) => onFieldChange('frequency', Number.parseInt(e.target.value, 10) || 1)}
          />
        </label>
        <label className="bf-field bf-field--block">
          <span className="bf-label">自分のメモ</span>
          <textarea
            className="input textarea"
            rows={2}
            value={form.memo}
            onChange={(e) => onFieldChange('memo', e.target.value)}
          />
        </label>
        <div className="bf-form-actions">
          <button type="submit" className="btn btn-primary">
            保存
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              キャンセル
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

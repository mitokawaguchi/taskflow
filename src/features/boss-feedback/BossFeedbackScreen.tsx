import { BossFeedbackForm } from './BossFeedbackForm'
import { BossFeedbackList } from './BossFeedbackList'
import { useBossFeedback } from './hooks'

type Props = {
  addToast: (icon: string, title: string, msg: string) => void
}

/** 上司指摘 DB 画面（一覧 + フォーム） */
export default function BossFeedbackScreen({ addToast }: Readonly<Props>) {
  const bf = useBossFeedback(addToast)

  const handleEdit = (row: Parameters<typeof bf.startEdit>[0]) => {
    bf.startEdit(row)
    queueMicrotask(() => {
      document.getElementById('boss-feedback-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="bf-screen">
      <p className="text-muted bf-lead">
        レビュー指摘を記録し、パターンを把握するための一覧です。
      </p>
      <BossFeedbackList
        loading={bf.loading}
        items={bf.items}
        filters={bf.filters}
        onFiltersChange={bf.setFilters}
        onEdit={handleEdit}
        onDelete={bf.handleDelete}
      />
      <BossFeedbackForm
        form={bf.form}
        editingId={bf.editingId}
        onFieldChange={bf.updateField}
        onSubmit={bf.handleSubmit}
        onCancel={bf.resetForm}
      />
    </div>
  )
}

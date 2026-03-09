import ClientDetail from '../ClientDetail'

/** クライアント詳細ビュー（view.startsWith('c:') 用）。SMELL-002: IIFE をコンポーネントに抽出 */
export default function ClientDetailView({
  clientId,
  clients,
  remembers,
  onBack,
  onAddRemember,
  onUpdateRemember,
  onDeleteRemember,
}) {
  const client = clients.find((c) => c.id === clientId)
  if (!client) return null
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={onBack}>
        ← クライアント一覧
      </button>
      <ClientDetail
        client={client}
        remembers={remembers.filter((r) => r.clientId === client.id)}
        onAddRemember={onAddRemember}
        onUpdateRemember={onUpdateRemember}
        onDeleteRemember={onDeleteRemember}
      />
    </>
  )
}

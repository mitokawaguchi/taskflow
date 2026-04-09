/** 教材一覧（サイト内 PDF ビューア用）。追加時は public/materials に PDF を置き、ここにエントリを足す。 */

export type MaterialItem = {
  id: string
  title: string
  seriesLabel: string
  pdfPath: string
  fileLabel: string
}

export const MATERIALS: readonly MaterialItem[] = [
  {
    id: 'consulting-os-visual-guide',
    title: 'Consulting OS ビジュアルガイド',
    seriesLabel: '第1弾',
    pdfPath: '/materials/consulting-os-visual-guide.pdf',
    fileLabel: 'consulting_os_visual_guide.pdf',
  },
]

export function getMaterialById(id: string): MaterialItem | undefined {
  return MATERIALS.find((m) => m.id === id)
}

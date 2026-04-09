import { describe, it, expect } from 'vitest'
import { getMaterialById, MATERIALS } from '../../data/materials'
import { getMaterialIdFromPath } from './materialsPath'

describe('materials registry', () => {
  it('第1弾の教材が登録されている', () => {
    expect(MATERIALS.length).toBeGreaterThanOrEqual(1)
    const m = getMaterialById('consulting-os-visual-guide')
    expect(m?.pdfPath).toBe('/materials/consulting-os-visual-guide.pdf')
  })
  it('パスから教材 ID を解決する', () => {
    expect(getMaterialIdFromPath('/materials')).toBeNull()
    expect(getMaterialIdFromPath('/materials/')).toBeNull()
    expect(getMaterialIdFromPath('/materials/consulting-os-visual-guide')).toBe('consulting-os-visual-guide')
  })
})

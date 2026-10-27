import { describe, test, expect } from 'vitest'
import { snapPlacement } from './use-block-drag'

// Editor 1200px wide → 12 columns of 100px; block 300px wide
describe('snapPlacement', () => {
  test('aimante au centre quand le milieu du bloc est proche du milieu', () => {
    expect(snapPlacement(440, 300, 1200)).toMatchObject({ align: 'center', offset: null, left: 450 })
  })

  test('aimante à droite près du bord droit', () => {
    expect(snapPlacement(880, 300, 1200)).toMatchObject({ align: 'right', offset: null, left: 900 })
  })

  test('colle à gauche près du bord gauche', () => {
    expect(snapPlacement(30, 300, 1200)).toMatchObject({ align: 'left', offset: null, left: 0 })
  })

  test('sinon prend la colonne la plus proche', () => {
    expect(snapPlacement(180, 300, 1200)).toMatchObject({ align: 'left', offset: '16.67%', left: 200 })
  })

  test('ne fait jamais déborder le bloc à droite', () => {
    expect(snapPlacement(760, 300, 1200).left + 300).toBeLessThanOrEqual(1200)
  })
})

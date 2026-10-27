import { describe, test, expect } from 'vitest'
import { sanitizeTiptapContent } from './sanitize-tiptap-content'

const image = (width: unknown) => ({ type: 'doc', content: [{ type: 'customImage', attrs: { src: 'https://images.page-satellite.com/a.webp', width } }] })
const widthOf = (doc: ReturnType<typeof image>) => (sanitizeTiptapContent(doc).content[0].attrs as { width: string }).width

describe('sanitizeTiptapContent — largeur des images', () => {
  test.each(['50%', '33.33%', '640px'])('garde une largeur valide : %s', (w) => {
    expect(widthOf(image(w))).toBe(w)
  })

  test.each(['100%; background:url(https://evil)', 'calc(100% - 1px)', 42, null])('remplace une largeur invalide : %s', (w) => {
    expect(widthOf(image(w))).toBe('100%')
  })

  test('nettoie aussi la largeur des images de galerie', () => {
    const doc = { type: 'doc', content: [{ type: 'imageGallery', attrs: { images: [{ src: 'https://x/a.webp', width: '1px;color:red' }] } }] }
    const result = sanitizeTiptapContent(doc).content[0].attrs as { images: { width: string }[] }
    expect(result.images[0].width).toBe('100%')
  })
})

describe('sanitizeTiptapContent — position des blocs', () => {
  const block = (attrs: Record<string, unknown>) => sanitizeTiptapContent({ type: 'doc', content: [{ type: 'ctaButton', attrs: { href: 'https://x', ...attrs } }] }).content[0].attrs as Record<string, unknown>

  test('garde un décalage valide sur un bloc aligné à gauche', () => {
    expect(block({ align: 'left', offset: '33.33%' })).toMatchObject({ align: 'left', offset: '33.33%' })
  })

  test('ignore le décalage si le bloc est centré ou à droite', () => {
    expect(block({ align: 'center', offset: '25%' }).offset).toBeNull()
  })

  test('rejette un alignement ou un décalage invalide', () => {
    expect(block({ align: 'left; color:red', offset: '25%; x:y' })).toMatchObject({ align: 'left', offset: null })
  })
})

describe('sanitizeTiptapContent — couleur de survol du CTA', () => {
  const hoverOf = (hoverColor: unknown) => (sanitizeTiptapContent({ type: 'doc', content: [{ type: 'ctaButton', attrs: { href: 'https://x', hoverColor } }] }).content[0].attrs as { hoverColor: string | null }).hoverColor

  test('garde une couleur hexadécimale', () => {
    expect(hoverOf('#1e40af')).toBe('#1e40af')
  })

  test.each(['red; background:url(https://evil)', 42, undefined])('remplace une valeur invalide par le survol automatique : %s', (c) => {
    expect(hoverOf(c)).toBeNull()
  })
})

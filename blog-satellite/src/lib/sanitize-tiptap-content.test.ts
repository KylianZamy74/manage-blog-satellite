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

import { describe, test, expect } from 'vitest'
import { extractFirstImage } from './extract-image'

describe('extractFirstImage', () => {

  test('retourne null si content est null', () => {
    expect(extractFirstImage(null)).toBe(null)
  })

  test('retourne null si content est undefined', () => {
    expect(extractFirstImage(undefined)).toBe(null)
  })

  test('retourne null si content est un objet vide', () => {
    expect(extractFirstImage({})).toBe(null)
  })

  test('extrait l\'image d\'un customImage direct', () => {
    const content = {
      type: 'customImage',
      attrs: { src: 'https://example.com/image.jpg' }
    }
    expect(extractFirstImage(content)).toBe('https://example.com/image.jpg')
  })

  test('extrait la première image d\'une imageGallery', () => {
    const content = {
      type: 'imageGallery',
      attrs: {
        images: [
          { src: 'https://example.com/first.jpg' },
          { src: 'https://example.com/second.jpg' }
        ]
      }
    }
    expect(extractFirstImage(content)).toBe('https://example.com/first.jpg')
  })

  test('retourne null si imageGallery a un tableau images vide', () => {
    const content = {
      type: 'imageGallery',
      attrs: { images: [] }
    }
    expect(extractFirstImage(content)).toBe(null)
  })

  test('trouve une image imbriquée dans le content', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
        { type: 'customImage', attrs: { src: 'https://example.com/nested.jpg' } }
      ]
    }
    expect(extractFirstImage(content)).toBe('https://example.com/nested.jpg')
  })

  test('trouve une image profondément imbriquée', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'customImage', attrs: { src: 'https://example.com/deep.jpg' } }
              ]
            }
          ]
        }
      ]
    }
    expect(extractFirstImage(content)).toBe('https://example.com/deep.jpg')
  })

  test('retourne la première image trouvée quand il y en a plusieurs', () => {
    const content = {
      type: 'doc',
      content: [
        { type: 'customImage', attrs: { src: 'https://example.com/first.jpg' } },
        { type: 'customImage', attrs: { src: 'https://example.com/second.jpg' } }
      ]
    }
    expect(extractFirstImage(content)).toBe('https://example.com/first.jpg')
  })

  test('retourne null si customImage n\'a pas d\'attrs', () => {
    const content = { type: 'customImage' }
    expect(extractFirstImage(content)).toBe(null)
  })

  test('retourne null si customImage.attrs n\'a pas de src', () => {
    const content = { type: 'customImage', attrs: { alt: 'Une image' } }
    expect(extractFirstImage(content)).toBe(null)
  })

  test('cas réel : contenu TipTap typique', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Mon Article' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Introduction...' }]
        },
        {
          type: 'customImage',
          attrs: {
            src: 'https://res.cloudinary.com/xxx/image/upload/v123/cover.webp',
            alt: 'Image de couverture',
            width: 800
          }
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Suite de l\'article...' }]
        }
      ]
    }
    expect(extractFirstImage(content)).toBe('https://res.cloudinary.com/xxx/image/upload/v123/cover.webp')
  })
})

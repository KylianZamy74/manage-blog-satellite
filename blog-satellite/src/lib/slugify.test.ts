import { describe, test, expect } from 'vitest'
import slugify from './slugify'

describe('slugify', () => {

  test('convertit un texte simple en slug', () => {
    const input = 'Mon Article'
    const result = slugify(input)
    expect(result).toBe('mon-article')
  })

  test('supprime les accents', () => {
    expect(slugify('Café crème à la française')).toBe('cafe-creme-a-la-francaise')
  })

  test('remplace les caractères spéciaux par des tirets', () => {
    expect(slugify("L'article de Jean-Pierre")).toBe('l-article-de-jean-pierre')
  })

  test('gère les espaces multiples', () => {
    expect(slugify('Trop   d\'espaces   ici')).toBe('trop-d-espaces-ici')
  })

  test('convertit en minuscules', () => {
    expect(slugify('TOUT EN MAJUSCULES')).toBe('tout-en-majuscules')
  })

  test('retourne une string vide si input vide', () => {
    expect(slugify('')).toBe('')
  })

  test('gère gracieusement les valeurs nullish', () => {
    // @ts-expect-error - On teste volontairement un mauvais type
    expect(slugify(null)).toBe('')
    // @ts-expect-error
    expect(slugify(undefined)).toBe('')
  })

  test('supprime les espaces au début et à la fin', () => {
    expect(slugify('  Mon Article  ')).toBe('mon-article')
  })

  test('évite les tirets multiples consécutifs', () => {
    expect(slugify('Article - - - Test')).toBe('article-test')
  })

  test('conserve les chiffres', () => {
    expect(slugify('Top 10 des meilleurs articles 2024')).toBe('top-10-des-meilleurs-articles-2024')
  })

  test('cas réel : titre d\'article blog', () => {
    expect(slugify("Comment optimiser son SEO en 2024 : Guide complet")).toBe('comment-optimiser-son-seo-en-2024-guide-complet')
  })
})

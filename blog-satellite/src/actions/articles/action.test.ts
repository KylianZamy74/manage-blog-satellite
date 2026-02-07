import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

const prismaMock = mockDeep<PrismaClient>()
const authMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock
}))

vi.mock('@/lib/auth', () => ({
  auth: authMock
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

beforeEach(() => {
  mockReset(prismaMock)
  vi.clearAllMocks()
})

describe('editArticle', () => {

  test('retourne erreur si utilisateur non authentifié', async () => {
    authMock.mockResolvedValue(null)

    const { editArticle } = await import('./action')

    const formData = new FormData()
    formData.set('title', 'Titre modifié')
    formData.set('content', JSON.stringify({ type: 'doc', content: [] }))

    const result = await editArticle('article-123', null, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Non authentifié')
  })

  test('retourne erreur si article n\'appartient pas à l\'utilisateur (CLIENT)', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-123', role: 'CLIENT' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'autre-user',
      title: 'Article',
      slug: 'article',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const { editArticle } = await import('./action')

    const formData = new FormData()
    formData.set('title', 'Titre modifié')
    formData.set('content', JSON.stringify({ type: 'doc', content: [] }))

    const result = await editArticle('article-123', null, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Non autorisé')
  })

  test('admin peut éditer un draft d\'un autre utilisateur', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin-123', role: 'ADMIN' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'autre-user',
      title: 'Article',
      slug: 'article',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    prismaMock.article.update.mockResolvedValue({} as any)

    const { editArticle } = await import('./action')

    const formData = new FormData()
    formData.set('title', 'Titre modifié')
    formData.set('content', JSON.stringify({ type: 'doc', content: [] }))

    const result = await editArticle('article-123', null, formData)

    expect(result.success).toBe(true)
  })

  test('admin ne peut pas éditer un article publié d\'un autre utilisateur', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin-123', role: 'ADMIN' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'autre-user',
      title: 'Article',
      slug: 'article',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const { editArticle } = await import('./action')

    const formData = new FormData()
    formData.set('title', 'Titre modifié')
    formData.set('content', JSON.stringify({ type: 'doc', content: [] }))

    const result = await editArticle('article-123', null, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Non autorisé')
  })

  test('modifie un article avec succès', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-123', role: 'CLIENT' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'user-123',
      title: 'Ancien titre',
      slug: 'ancien-titre',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    prismaMock.article.update.mockResolvedValue({
      id: 'article-123',
      authorId: 'user-123',
      title: 'Nouveau titre',
      slug: 'nouveau-titre',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const { editArticle } = await import('./action')

    const formData = new FormData()
    formData.set('title', 'Nouveau titre')
    formData.set('content', JSON.stringify({ type: 'doc', content: [] }))

    const result = await editArticle('article-123', null, formData)

    expect(result.success).toBe(true)
    expect(prismaMock.article.update).toHaveBeenCalledTimes(1)
  })
})

describe('deleteArticle', () => {

  test('retourne erreur si utilisateur non authentifié', async () => {
    authMock.mockResolvedValue(null)

    const { deleteArticle } = await import('./action')

    const result = await deleteArticle('article-123')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Non authentifié')
  })

  test('retourne erreur si article n\'appartient pas à l\'utilisateur (CLIENT)', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-123', role: 'CLIENT' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'autre-user',
      title: 'Article',
      slug: 'article',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const { deleteArticle } = await import('./action')

    const result = await deleteArticle('article-123')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Non autorisé')
  })

  test('admin peut supprimer un draft d\'un autre utilisateur', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin-123', role: 'ADMIN' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'autre-user',
      title: 'Article',
      slug: 'article',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    prismaMock.article.delete.mockResolvedValue({} as any)

    const { deleteArticle } = await import('./action')

    const result = await deleteArticle('article-123')

    expect(result.success).toBe(true)
  })

  test('supprime un article avec succès', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-123', role: 'CLIENT' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'user-123',
      title: 'Article',
      slug: 'article',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    prismaMock.article.delete.mockResolvedValue({
      id: 'article-123',
      authorId: 'user-123',
      title: 'Article',
      slug: 'article',
      content: {},
      excerpt: null,
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const { deleteArticle } = await import('./action')

    const result = await deleteArticle('article-123')

    expect(result.success).toBe(true)
    expect(prismaMock.article.delete).toHaveBeenCalledWith({ where: { id: 'article-123' } })
  })
})

describe('getArticle', () => {

  test('retourne un article par son ID', async () => {
    const mockArticle = {
      id: 'article-123',
      title: 'Mon Article',
      slug: 'mon-article',
      content: { type: 'doc', content: [] },
      excerpt: 'Résumé',
      image: null,
      metaDescription: null,
      metaTitle: null,
      status: 'PUBLISHED',
      authorId: 'user-123',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    prismaMock.article.findUnique.mockResolvedValue(mockArticle)

    const { getArticle } = await import('./action')

    const result = await getArticle('article-123')

    expect(result).toEqual(mockArticle)
    expect(prismaMock.article.findUnique).toHaveBeenCalledWith({ where: { id: 'article-123' } })
  })

  test('retourne null si article non trouvé', async () => {
    prismaMock.article.findUnique.mockResolvedValue(null)

    const { getArticle } = await import('./action')

    const result = await getArticle('inexistant')

    expect(result).toBeNull()
  })
})

describe('getArticles', () => {

  test('retourne tous les articles triés par date', async () => {
    const mockArticles = [
      { id: '1', title: 'Article 1', createdAt: new Date('2024-02-01') },
      { id: '2', title: 'Article 2', createdAt: new Date('2024-01-01') }
    ]

    prismaMock.article.findMany.mockResolvedValue(mockArticles as any)

    const { getArticles } = await import('./action')

    const result = await getArticles()

    expect(result).toEqual(mockArticles)
    expect(prismaMock.article.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' }
    })
  })
})

describe('getMyArticles', () => {

  test('retourne erreur si pas de session', async () => {
    authMock.mockResolvedValue(null)

    const { getMyArticles } = await import('./action')

    const result = await getMyArticles()

    expect(result).toEqual({ success: false, message: 'Aucune session actives' })
  })

  test('retourne les articles de l\'utilisateur connecté', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-123' } })

    const mockArticles = [
      {
        id: '1',
        title: 'Mon Article',
        authorId: 'user-123',
        content: { type: 'doc', content: [] }
      }
    ]

    prismaMock.article.findMany.mockResolvedValue(mockArticles as any)

    const { getMyArticles } = await import('./action')

    const result = await getMyArticles()

    expect(Array.isArray(result)).toBe(true)
    expect(prismaMock.article.findMany).toHaveBeenCalledWith({
      where: { authorId: 'user-123' },
      orderBy: { createdAt: 'desc' }
    })
  })
})

describe('publishArticle', () => {

  test('retourne erreur si non authentifié', async () => {
    authMock.mockResolvedValue(null)

    const { publishArticle } = await import('./action')

    const result = await publishArticle('article-123')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Non authentifié')
  })

  test('publie un article avec succès (propriétaire)', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-123', role: 'CLIENT' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'user-123',
      status: 'DRAFT'
    } as any)

    prismaMock.article.update.mockResolvedValue({
      id: 'article-123',
      status: 'PUBLISHED',
      publishedAt: new Date()
    } as any)

    const { publishArticle } = await import('./action')

    const result = await publishArticle('article-123')

    expect(result.success).toBe(true)
    expect(result.message).toBe('Article publié !')
    expect(prismaMock.article.update).toHaveBeenCalledWith({
      where: { id: 'article-123' },
      data: { status: 'PUBLISHED', publishedAt: expect.any(Date) }
    })
  })

  test('admin peut publier un draft d\'un autre utilisateur', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin-123', role: 'ADMIN' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'autre-user',
      status: 'DRAFT'
    } as any)

    prismaMock.article.update.mockResolvedValue({} as any)

    const { publishArticle } = await import('./action')

    const result = await publishArticle('article-123')

    expect(result.success).toBe(true)
  })

  test('client ne peut pas publier article d\'un autre', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-123', role: 'CLIENT' } })

    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-123',
      authorId: 'autre-user',
      status: 'DRAFT'
    } as any)

    const { publishArticle } = await import('./action')

    const result = await publishArticle('article-123')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Non autorisé')
  })
})

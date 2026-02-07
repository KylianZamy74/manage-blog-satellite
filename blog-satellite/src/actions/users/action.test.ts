import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

const prismaMock = mockDeep<PrismaClient>()

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

beforeEach(() => {
  mockReset(prismaMock)
  vi.clearAllMocks()
})

describe('createUser', () => {

  test('retourne erreur si email manquant', async () => {
    const { createUser } = await import('./action')

    const formData = new FormData()
    formData.set('email', '')
    formData.set('name', 'John Doe')

    const result = await createUser(null, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe("Cet email n'existe pas")
  })

  test('retourne erreur si email déjà existant', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'john@example.com',
      name: 'John',
      slug: 'john',
      role: 'CLIENT',
      createdAt: new Date()
    })

    const { createUser } = await import('./action')

    const formData = new FormData()
    formData.set('email', 'john@example.com')
    formData.set('name', 'John Doe')

    const result = await createUser(null, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Email déjà existant')
  })

  test('crée un utilisateur avec succès', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({
      id: 'user-123',
      email: 'nouveau@example.com',
      name: 'Nouveau User',
      slug: 'nouveau-user',
      role: 'CLIENT',
      createdAt: new Date()
    })

    const { createUser } = await import('./action')

    const formData = new FormData()
    formData.set('email', 'nouveau@example.com')
    formData.set('name', 'Nouveau User')

    const result = await createUser(null, formData)

    expect(result.success).toBe(true)
    expect(result.message).toContain('succès')
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'nouveau@example.com',
        name: 'Nouveau User',
        slug: 'nouveau-user',
        role: 'CLIENT'
      }
    })
  })

  test('génère le slug à partir du nom', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({
      id: 'user-123',
      email: 'jean@example.com',
      name: 'Jean-Pierre Dupont',
      slug: 'jean-pierre-dupont',
      role: 'CLIENT',
      createdAt: new Date()
    })

    const { createUser } = await import('./action')

    const formData = new FormData()
    formData.set('email', 'jean@example.com')
    formData.set('name', 'Jean-Pierre Dupont')

    await createUser(null, formData)

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'jean-pierre-dupont'
        })
      })
    )
  })

  test('gère les erreurs Prisma', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockRejectedValue(new Error('DB Error'))

    const { createUser } = await import('./action')

    const formData = new FormData()
    formData.set('email', 'test@example.com')
    formData.set('name', 'Test User')

    const result = await createUser(null, formData)

    expect(result.success).toBe(false)
    expect(result.message).toContain('Echec')
  })
})

describe('deleteUser', () => {

  test('supprime un utilisateur avec succès', async () => {
    prismaMock.user.delete.mockResolvedValue({
      id: 'user-123',
      email: 'john@example.com',
      name: 'John',
      slug: 'john',
      role: 'CLIENT',
      createdAt: new Date()
    })

    const { deleteUser } = await import('./action')

    const result = await deleteUser('user-123')

    expect(result.success).toBe(true)
    expect(result.message).toContain('succès')
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'user-123' } })
  })

  test('gère les erreurs lors de la suppression', async () => {
    prismaMock.user.delete.mockRejectedValue(new Error('User not found'))

    const { deleteUser } = await import('./action')

    const result = await deleteUser('inexistant')

    expect(result.success).toBe(false)
    expect(result.message).toContain('Echec')
  })
})

describe('getUsers', () => {

  test('retourne tous les utilisateurs triés par date', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1', email: 'user1@test.com', createdAt: new Date('2024-02-01') },
      { id: '2', name: 'User 2', email: 'user2@test.com', createdAt: new Date('2024-01-01') }
    ]

    prismaMock.user.findMany.mockResolvedValue(mockUsers as any)

    const { getUsers } = await import('./action')

    const result = await getUsers()

    expect(result).toEqual(mockUsers)
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' }
    })
  })

  test('gère les erreurs', async () => {
    prismaMock.user.findMany.mockRejectedValue(new Error('DB Error'))

    const { getUsers } = await import('./action')

    const result = await getUsers()

    expect(result).toEqual({ success: false, message: 'Erreur lors de la récupération des utilisateurs' })
  })
})

describe('getUser', () => {

  test('retourne un utilisateur par son ID', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'john@example.com',
      name: 'John Doe',
      slug: 'john-doe',
      role: 'CLIENT',
      createdAt: new Date()
    }

    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const { getUser } = await import('./action')

    const result = await getUser('user-123')

    expect(result).toEqual(mockUser)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' } })
  })

  test('retourne null si utilisateur non trouvé', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const { getUser } = await import('./action')

    const result = await getUser('inexistant')

    expect(result).toBeNull()
  })

  test('gère les erreurs', async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error('DB Error'))

    const { getUser } = await import('./action')

    const result = await getUser('user-123')

    expect(result).toEqual({ success: false, message: "Erreur lors de la récupération de l'utilisateur" })
  })
})

import { PrismaClient } from '@prisma/client'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'

// Neon over HTTP: stateless (no socket pool), so a shared client is safe on Cloudflare Workers.
// Not supported by this adapter: interactive transactions ($transaction).
const createPrisma = () =>
  new PrismaClient({ adapter: new PrismaNeonHTTP(process.env.DATABASE_URL!, {}) })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

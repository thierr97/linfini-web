// Shared DB client with in-memory fallback
let prismaInstance: any = null

export async function getDb() {
  if (prismaInstance) return prismaInstance
  try {
    const { prisma } = await import('@linfini/db')
    await prisma.$queryRaw`SELECT 1`
    prismaInstance = prisma
    return prisma
  } catch {
    return null
  }
}

export const TVA = 0.085

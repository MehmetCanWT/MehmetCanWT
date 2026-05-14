import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getPinnedAnimeIds() {
  const pins = await prisma.anime.findMany({ where: { isPinned: true }, select: { anilistId: true } });
  return pins.map(p => p.anilistId);
}

export async function getPinnedGameIds() {
  const pins = await prisma.game.findMany({ where: { isPinned: true }, select: { steamId: true } });
  return pins.map(p => p.steamId);
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "anime") {
    const pins = await prisma.anime.findMany({ where: { isPinned: true }, select: { anilistId: true } });
    return NextResponse.json({ pins: pins.map(p => p.anilistId) });
  }

  if (type === "game") {
    const pins = await prisma.game.findMany({ where: { isPinned: true }, select: { steamId: true } });
    return NextResponse.json({ pins: pins.map(p => p.steamId) });
  }

  return NextResponse.json({ pins: [] });
}

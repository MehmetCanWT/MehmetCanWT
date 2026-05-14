import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, isPinned, title } = await req.json();
  
  await prisma.game.upsert({
    where: { steamId: id },
    update: { isPinned },
    create: { steamId: id, isPinned, title: title || "" }
  });

  return NextResponse.json({ success: true });
}

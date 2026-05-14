import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, isPinned, title } = await req.json();
  
  await prisma.anime.upsert({
    where: { anilistId: id },
    update: { isPinned },
    create: { anilistId: id, isPinned, title: title || "" }
  });

  return NextResponse.json({ success: true });
}

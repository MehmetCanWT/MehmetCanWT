import { getAllAnime } from "@/lib/anilist";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getAllAnime("MehmetCanWT");
  return NextResponse.json(data);
}

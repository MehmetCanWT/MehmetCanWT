import { getAllGames } from "@/lib/steam";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getAllGames("76561198200466026");
  return NextResponse.json(data);
}

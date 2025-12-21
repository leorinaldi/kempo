import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tracks = await prisma.audio.findMany({
      orderBy: { kyDate: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        url: true,
        artist: true,
        artistSlug: true,
      },
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Failed to fetch SoundWaves tracks:", error)
    return NextResponse.json([])
  }
}

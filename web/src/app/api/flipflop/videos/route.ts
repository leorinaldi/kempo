import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      where: {
        aspectRatio: "portrait",
      },
      orderBy: { kyDate: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        artist: true,
        artistSlug: true,
      },
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Failed to fetch FlipFlop videos:", error)
    return NextResponse.json([])
  }
}

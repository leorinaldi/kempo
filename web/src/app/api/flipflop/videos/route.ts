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
        artistPerson: {
          select: {
            articleId: true,
          }
        },
      },
    })

    // Transform to include articleId from Person relation
    const items = videos.map(video => ({
      id: video.id,
      name: video.name,
      url: video.url,
      description: video.description,
      artist: video.artist,
      artistArticleId: video.artistPerson?.articleId || "",
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch FlipFlop videos:", error)
    return NextResponse.json([])
  }
}

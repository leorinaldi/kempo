import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export async function GET() {
  try {
    // Fetch all video files with artist relation
    const videos = await prisma.video.findMany({
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

    // Transform to the format expected by the frontend
    const items = videos.map((video) => ({
      id: video.id,
      name: video.name,
      description: video.description || "",
      url: video.url,
      artist: video.artist || "",
      artistArticleId: video.artistPerson?.articleId || "",
    }))

    // Return shuffled playlist
    return NextResponse.json(shuffle(items))
  } catch (error) {
    console.error("Failed to fetch TV playlist:", error)
    return NextResponse.json([])
  }
}

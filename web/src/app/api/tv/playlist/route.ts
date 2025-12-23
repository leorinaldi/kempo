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
    // Fetch all video files
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        artist: true,
        artistSlug: true,
      },
    })

    // Get article IDs for all unique artistSlugs
    const artistSlugs = Array.from(new Set(videos.map(v => v.artistSlug).filter(Boolean))) as string[]
    const articles = await prisma.article.findMany({
      where: { slug: { in: artistSlugs } },
      select: { id: true, slug: true },
    })
    const slugToIdMap = Object.fromEntries(articles.map(a => [a.slug, a.id]))

    // Transform to the format expected by the frontend
    const items = videos.map((video) => ({
      id: video.id,
      name: video.name,
      description: video.description || "",
      url: video.url,
      artist: video.artist || "",
      artistArticleId: video.artistSlug ? slugToIdMap[video.artistSlug] || "" : "",
    }))

    // Return shuffled playlist
    return NextResponse.json(shuffle(items))
  } catch (error) {
    console.error("Failed to fetch TV playlist:", error)
    return NextResponse.json([])
  }
}

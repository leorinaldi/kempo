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

    // Get article IDs for all unique artistSlugs
    const artistSlugs = Array.from(new Set(videos.map(v => v.artistSlug).filter(Boolean))) as string[]
    const articles = await prisma.article.findMany({
      where: { slug: { in: artistSlugs } },
      select: { id: true, slug: true },
    })
    const slugToIdMap = Object.fromEntries(articles.map(a => [a.slug, a.id]))

    // Transform to include articleId instead of slug
    const items = videos.map(video => ({
      id: video.id,
      name: video.name,
      url: video.url,
      description: video.description,
      artist: video.artist,
      artistArticleId: video.artistSlug ? slugToIdMap[video.artistSlug] || "" : "",
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch FlipFlop videos:", error)
    return NextResponse.json([])
  }
}

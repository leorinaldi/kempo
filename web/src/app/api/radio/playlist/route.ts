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
    // Fetch all audio files with their elements
    const audioFiles = await prisma.audio.findMany({
      include: {
        elements: true,
      },
    })

    // Get singer info from elements
    const singerIds = audioFiles.flatMap((audio) =>
      audio.elements
        .filter((e) => e.itemType === "singer")
        .map((e) => e.itemId)
    )
    const singers = await prisma.person.findMany({
      where: { id: { in: singerIds } },
      include: { article: true },
    })
    const singerMap = Object.fromEntries(
      singers.map((p) => [
        p.id,
        {
          name: p.stageName || `${p.nickname || p.firstName} ${p.lastName}`,
          articleId: p.article?.id || "",
        },
      ])
    )

    // Transform to the format expected by the frontend
    const items = audioFiles.map((audio) => {
      const singerElement = audio.elements.find((e) => e.itemType === "singer")
      const singer = singerElement ? singerMap[singerElement.itemId] : null
      return {
        id: audio.id,
        name: audio.name,
        artist: singer?.name || "",
        artistArticleId: singer?.articleId || "",
        url: audio.url,
      }
    })

    // Return shuffled playlist
    return NextResponse.json(shuffle(items))
  } catch (error) {
    console.error("Failed to fetch radio playlist:", error)
    return NextResponse.json([])
  }
}

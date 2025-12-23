import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const audioFiles = await prisma.audio.findMany({
      where: { type: "song" },
      orderBy: { kyDate: "desc" },
      include: {
        elements: true,
      },
    })

    // Get singer info from elements
    const singerIds = audioFiles.flatMap((a) =>
      a.elements
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
          slug: p.article?.slug || "",
        },
      ])
    )

    const tracks = audioFiles.map((a) => {
      const singerElement = a.elements.find((e) => e.itemType === "singer")
      const singer = singerElement ? singerMap[singerElement.itemId] : null
      return {
        id: a.id,
        slug: a.slug,
        name: a.name,
        url: a.url,
        artist: singer?.name || "",
        artistSlug: singer?.slug || "",
      }
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Failed to fetch SoundWaves tracks:", error)
    return NextResponse.json([])
  }
}

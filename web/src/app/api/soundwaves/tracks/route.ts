import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseKYDateParam, kyDateFilter } from "@/lib/ky-date-filter"

export async function GET(request: NextRequest) {
  try {
    // Parse KY date filter from query params
    const { searchParams } = new URL(request.url)
    const maxDate = parseKYDateParam(searchParams.get("ky"))

    const audioFiles = await prisma.audio.findMany({
      where: { type: "song", ...kyDateFilter(maxDate) },
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
          articleId: p.article?.id || "",
        },
      ])
    )

    // Get album info from elements
    const albumIds = audioFiles.flatMap((a) =>
      a.elements
        .filter((e) => e.itemType === "album")
        .map((e) => e.itemId)
    )
    const albums = await prisma.album.findMany({
      where: { id: { in: albumIds } },
      include: { article: true },
    })
    const albumMap = Object.fromEntries(
      albums.map((a) => [
        a.id,
        {
          id: a.id,
          name: a.name,
        },
      ])
    )

    const tracks = audioFiles.map((a) => {
      const singerElement = a.elements.find((e) => e.itemType === "singer")
      const singer = singerElement ? singerMap[singerElement.itemId] : null
      const albumElement = a.elements.find((e) => e.itemType === "album")
      const album = albumElement ? albumMap[albumElement.itemId] : null
      return {
        id: a.id,
        name: a.name,
        url: a.url,
        artist: singer?.name || "",
        artistArticleId: singer?.articleId || "",
        albumId: album?.id || "",
        albumName: album?.name || "",
      }
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Failed to fetch SoundWaves tracks:", error)
    return NextResponse.json([])
  }
}

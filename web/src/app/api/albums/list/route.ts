import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const albums = await prisma.album.findMany({
      orderBy: { name: "asc" },
      include: {
        artist: true,
        label: {
          select: { id: true, name: true },
        },
        article: {
          select: { id: true, slug: true, title: true },
        },
      },
    })

    const result = albums.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      artistId: a.artistId,
      artistName: a.artist
        ? `${a.artist.nickname || a.artist.firstName} ${a.artist.lastName}`
        : null,
      labelId: a.labelId,
      labelName: a.label?.name || null,
      kyDate: a.kyDate,
      articleId: a.articleId,
      article: a.article,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to list albums:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list albums" },
      { status: 500 }
    )
  }
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id, name, slug, artistId, kyDate, articleId } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Album ID is required" }, { status: 400 })
    }

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if another album has this slug
    const existing = await prisma.album.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Another album with this slug already exists" }, { status: 409 })
    }

    const album = await prisma.album.update({
      where: { id },
      data: {
        name,
        slug,
        artistId: artistId || null,
        kyDate: kyDate ? new Date(kyDate) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(album)
  } catch (error) {
    console.error("Failed to update album:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update album" },
      { status: 500 }
    )
  }
}

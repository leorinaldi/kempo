import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { name, artistId, kyDate, articleId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const album = await prisma.album.create({
      data: {
        name,
        artistId: artistId || null,
        kyDate: kyDate ? new Date(kyDate) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(album)
  } catch (error) {
    console.error("Failed to create album:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create album" },
      { status: 500 }
    )
  }
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get media-type articles that aren't already linked to an album
    const articles = await prisma.article.findMany({
      where: {
        type: "media",
        album: null,
      },
      orderBy: { title: "asc" },
      select: {
        id: true,
        
        title: true,
      },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Failed to list available articles:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list available articles" },
      { status: 500 }
    )
  }
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get articles that could be brands (not already linked to a brand)
    // Brands might not have dedicated articles yet, so we look for any unlinked articles
    const articles = await prisma.article.findMany({
      where: {
        brand: null,
      },
      select: {
        id: true,
        
        title: true,
        type: true,
      },
      orderBy: { title: "asc" },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Failed to get available articles:", error)
    return NextResponse.json({ error: "Failed to get available articles" }, { status: 500 })
  }
}

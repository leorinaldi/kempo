import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const articles = await prisma.article.findMany({
      where: {
        type: "place",
        place: null,
      },
      select: {
        id: true,
        
        title: true,
      },
      orderBy: { title: "asc" },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Failed to list available articles:", error)
    return NextResponse.json({ error: "Failed to list available articles" }, { status: 500 })
  }
}

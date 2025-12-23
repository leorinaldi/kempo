import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, shortCode, dateFounded, dateDissolved, articleId } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (articleId) {
      const existingLink = await prisma.nation.findFirst({
        where: { articleId },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another nation" }, { status: 400 })
      }
    }

    const nation = await prisma.nation.create({
      data: {
        name,
        shortCode: shortCode || null,
        dateFounded: dateFounded ? new Date(dateFounded) : null,
        dateDissolved: dateDissolved ? new Date(dateDissolved) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(nation)
  } catch (error) {
    console.error("Failed to create nation:", error)
    return NextResponse.json({ error: "Failed to create nation" }, { status: 500 })
  }
}

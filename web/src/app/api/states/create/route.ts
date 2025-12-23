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
    const { name, abbreviation, stateType, nationId, dateFounded, dateDisbanded, articleId } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!stateType) {
      return NextResponse.json({ error: "State type is required" }, { status: 400 })
    }

    if (!nationId) {
      return NextResponse.json({ error: "Nation is required" }, { status: 400 })
    }

    if (articleId) {
      const existingLink = await prisma.state.findFirst({
        where: { articleId },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another state" }, { status: 400 })
      }
    }

    const state = await prisma.state.create({
      data: {
        name,
        abbreviation: abbreviation || null,
        stateType,
        nationId,
        dateFounded: dateFounded ? new Date(dateFounded) : null,
        dateDisbanded: dateDisbanded ? new Date(dateDisbanded) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(state)
  } catch (error) {
    console.error("Failed to create state:", error)
    return NextResponse.json({ error: "Failed to create state" }, { status: 500 })
  }
}

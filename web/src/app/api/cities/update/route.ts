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
    const { id, name, cityType, stateId, dateFounded, dateDisbanded, articleId } = body

    if (!id) {
      return NextResponse.json({ error: "City ID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!cityType) {
      return NextResponse.json({ error: "City type is required" }, { status: 400 })
    }

    if (!stateId) {
      return NextResponse.json({ error: "State is required" }, { status: 400 })
    }

    if (articleId) {
      const existingLink = await prisma.city.findFirst({
        where: {
          articleId,
          NOT: { id },
        },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another city" }, { status: 400 })
      }
    }

    const city = await prisma.city.update({
      where: { id },
      data: {
        name,
        cityType,
        stateId,
        dateFounded: dateFounded ? new Date(dateFounded) : null,
        dateDisbanded: dateDisbanded ? new Date(dateDisbanded) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error("Failed to update city:", error)
    return NextResponse.json({ error: "Failed to update city" }, { status: 500 })
  }
}

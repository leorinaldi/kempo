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
    const { id, name, organizationId, dateFounded, dateDiscontinued, articleId } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if article is already linked to another brand
    if (articleId) {
      const existingLink = await prisma.brand.findFirst({
        where: {
          articleId,
          id: { not: id },
        },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another brand" }, { status: 400 })
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        organizationId: organizationId || null,
        dateFounded: dateFounded ? new Date(dateFounded) : null,
        dateDiscontinued: dateDiscontinued ? new Date(dateDiscontinued) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error("Failed to update brand:", error)
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
  }
}

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
    const { id, name, abbreviation, orgType, dateFounded, dateDissolved, articleId } = body

    if (!id) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!orgType) {
      return NextResponse.json({ error: "Organization type is required" }, { status: 400 })
    }

    // Check if article is already linked to another organization
    if (articleId) {
      const existingLink = await prisma.organization.findFirst({
        where: {
          articleId,
          NOT: { id },
        },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another organization" }, { status: 400 })
      }
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        abbreviation: abbreviation || null,
        orgType,
        dateFounded: dateFounded ? new Date(dateFounded) : null,
        dateDissolved: dateDissolved ? new Date(dateDissolved) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Failed to update organization:", error)
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 })
  }
}

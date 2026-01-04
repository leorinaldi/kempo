import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getEntityConfig, isValidEntity } from "../../config"

type RouteParams = { params: Promise<{ entity: string }> }

// GET: Get articles available to link to this entity type
// (i.e., articles not already linked to another entity of this type)
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { entity } = await params
    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
    }

    const config = getEntityConfig(entity)

    // Events don't have article links
    if (!config.articleRelationField) {
      return NextResponse.json([])
    }

    // Build the where clause
    // If articleType is set, filter by that type AND ensure not linked
    // If articleType is null, just ensure not linked (any type allowed)
    const where: Record<string, unknown> = {
      [config.articleRelationField]: null, // Not linked to any entity of this type
    }

    if (config.articleType) {
      where.type = config.articleType
    }

    const articles = await prisma.article.findMany({
      where,
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

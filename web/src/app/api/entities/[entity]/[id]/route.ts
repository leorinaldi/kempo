import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getEntityConfig, isValidEntity } from "../../config"

type RouteParams = { params: Promise<{ entity: string; id: string }> }

// GET: Get single entity by ID
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { entity, id } = await params
    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
    }

    const config = getEntityConfig(entity)

    // @ts-expect-error - dynamic model access
    const item = await prisma[config.model].findUnique({
      where: { id },
      include: config.include,
    })

    if (!item) {
      return NextResponse.json(
        { error: `${config.labelSingular} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Failed to get entity:", error)
    return NextResponse.json({ error: "Failed to get entity" }, { status: 500 })
  }
}

// DELETE: Delete entity by ID
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { entity, id } = await params
    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
    }

    const config = getEntityConfig(entity)

    // @ts-expect-error - dynamic model access
    await prisma[config.model].delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete entity:", error)
    return NextResponse.json({ error: "Failed to delete entity" }, { status: 500 })
  }
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params

    const cities = await prisma.city.findMany({
      where: { stateId: id },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        _count: {
          select: { places: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error("Failed to list cities:", error)
    return NextResponse.json({ error: "Failed to list cities" }, { status: 500 })
  }
}

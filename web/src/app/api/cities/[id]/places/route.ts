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

    const places = await prisma.place.findMany({
      where: { cityId: id },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        parentPlace: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { childPlaces: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(places)
  } catch (error) {
    console.error("Failed to list places:", error)
    return NextResponse.json({ error: "Failed to list places" }, { status: 500 })
  }
}

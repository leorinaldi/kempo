import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const cities = await prisma.city.findMany({
      include: {
        state: {
          select: {
            id: true,
            name: true,
            nation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        article: {
          select: {
            id: true,
            
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

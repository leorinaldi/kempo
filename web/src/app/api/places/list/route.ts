import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const places = await prisma.place.findMany({
      include: {
        city: {
          select: {
            id: true,
            name: true,
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
          },
        },
        parentPlace: {
          select: {
            id: true,
            name: true,
          },
        },
        article: {
          select: {
            id: true,
            
            title: true,
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

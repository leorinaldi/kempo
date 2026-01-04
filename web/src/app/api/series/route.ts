import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const series = await prisma.series.findMany({
      orderBy: { title: "asc" },
      include: {
        network: { select: { id: true, name: true } },
        genres: { include: { genre: true } },
        _count: { select: { episodes: true } },
      },
    })
    return NextResponse.json(series)
  } catch (error) {
    console.error("Failed to fetch series:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, networkId, startYear, endYear, description, genreIds } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const series = await prisma.series.create({
      data: {
        title,
        networkId: networkId || null,
        startYear: startYear ? parseInt(startYear) : null,
        endYear: endYear ? parseInt(endYear) : null,
        description: description || null,
        genres: genreIds?.length
          ? {
              create: genreIds.map((genreId: string) => ({
                genreId,
              })),
            }
          : undefined,
      },
      include: {
        network: { select: { id: true, name: true } },
        genres: { include: { genre: true } },
      },
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error("Failed to create series:", error)
    return NextResponse.json({ error: "Failed to create series" }, { status: 500 })
  }
}

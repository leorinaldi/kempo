import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        network: { select: { id: true, name: true } },
        genres: { include: { genre: true } },
        episodes: {
          include: {
            video: { select: { id: true, name: true } },
          },
          orderBy: [{ seasonNum: "asc" }, { episodeNum: "asc" }],
        },
      },
    })

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    return NextResponse.json(series)
  } catch (error) {
    console.error("Failed to fetch series:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, networkId, startYear, endYear, description, genreIds } = body

    // Delete existing genre links and recreate
    await prisma.seriesGenre.deleteMany({ where: { seriesId: id } })

    const series = await prisma.series.update({
      where: { id },
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
    console.error("Failed to update series:", error)
    return NextResponse.json({ error: "Failed to update series" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.series.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete series:", error)
    return NextResponse.json({ error: "Failed to delete series" }, { status: 500 })
  }
}

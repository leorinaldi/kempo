import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get all elements for a video
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 })
    }

    const elements = await prisma.videoElement.findMany({
      where: { videoId },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            stageName: true,
            articleId: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(elements)
  } catch (error) {
    console.error("Failed to fetch video elements:", error)
    return NextResponse.json({ error: "Failed to fetch elements" }, { status: 500 })
  }
}

// POST - Add an element to a video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, personId, role, credit } = body

    if (!videoId || !personId || !role) {
      return NextResponse.json(
        { error: "videoId, personId, and role are required" },
        { status: 400 }
      )
    }

    // Check if this combination already exists
    const existing = await prisma.videoElement.findFirst({
      where: { videoId, personId, role },
    })

    if (existing) {
      return NextResponse.json(
        { error: "This person already has this role on this video" },
        { status: 400 }
      )
    }

    const element = await prisma.videoElement.create({
      data: {
        videoId,
        personId,
        role,
        credit: credit || null,
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            stageName: true,
            articleId: true,
          },
        },
      },
    })

    return NextResponse.json(element)
  } catch (error) {
    console.error("Failed to add video element:", error)
    return NextResponse.json({ error: "Failed to add element" }, { status: 500 })
  }
}

// DELETE - Remove an element
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await prisma.videoElement.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete video element:", error)
    return NextResponse.json({ error: "Failed to delete element" }, { status: 500 })
  }
}

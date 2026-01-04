import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const channels = await prisma.kempoTubeChannel.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { videos: true } },
      },
    })
    return NextResponse.json(channels)
  } catch (error) {
    console.error("Failed to fetch KempoTube channels:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const channel = await prisma.kempoTubeChannel.create({
      data: { name },
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error("Failed to create KempoTube channel:", error)
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 })
  }
}

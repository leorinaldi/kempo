import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const channels = await prisma.tvChannel.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { broadcasts: true } },
      },
    })
    return NextResponse.json(channels)
  } catch (error) {
    console.error("Failed to fetch TV channels:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, callSign } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const channel = await prisma.tvChannel.create({
      data: {
        name,
        callSign: callSign || null,
      },
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error("Failed to create TV channel:", error)
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 })
  }
}

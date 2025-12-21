import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    const [entries, total] = await Promise.all([
      prisma.projectHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.projectHistory.count(),
    ])

    return NextResponse.json({
      entries,
      hasMore: offset + entries.length < total,
      total,
    })
  } catch (error) {
    console.error("Failed to fetch project history entries:", error)
    return NextResponse.json({ entries: [], hasMore: false, total: 0 })
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { content } = await request.json()

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const entry = await prisma.projectHistory.create({
      data: { content: content.trim() },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Failed to create project history entry:", error)
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await request.json()

    await prisma.projectHistory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project history entry:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }
}

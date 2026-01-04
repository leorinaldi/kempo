import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, title, description, kyDateBegin, kyDateEnd, eventType, significance, parentId } = body

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!kyDateBegin) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 })
    }

    if (!eventType) {
      return NextResponse.json({ error: "Event type is required" }, { status: 400 })
    }

    // Prevent circular parent reference
    if (parentId === id) {
      return NextResponse.json({ error: "An event cannot be its own parent" }, { status: 400 })
    }

    // Validate parent exists if provided
    if (parentId) {
      const parentEvent = await prisma.event.findUnique({
        where: { id: parentId },
      })
      if (!parentEvent) {
        return NextResponse.json({ error: "Parent event not found" }, { status: 400 })
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description: description || null,
        kyDateBegin: new Date(kyDateBegin),
        kyDateEnd: kyDateEnd ? new Date(kyDateEnd) : null,
        eventType,
        significance: significance ?? 5,
        parentId: parentId || null,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to update event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

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

    // Get relations where this event is the source
    const relationsFrom = await prisma.eventRelation.findMany({
      where: { eventId: id },
      include: {
        relatedEvent: {
          select: {
            id: true,
            title: true,
            eventType: true,
            kyDateBegin: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    // Get relations where this event is the target
    const relationsTo = await prisma.eventRelation.findMany({
      where: { relatedEventId: id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            kyDateBegin: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({
      relationsFrom: relationsFrom.map((r) => ({
        id: r.id,
        relatedEventId: r.relatedEventId,
        relatedEvent: r.relatedEvent,
        relationType: r.relationType,
        direction: "from",
      })),
      relationsTo: relationsTo.map((r) => ({
        id: r.id,
        relatedEventId: r.eventId,
        relatedEvent: r.event,
        relationType: r.relationType,
        direction: "to",
      })),
    })
  } catch (error) {
    console.error("Failed to list event relations:", error)
    return NextResponse.json({ error: "Failed to list event relations" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { relatedEventId, relationType } = body

    if (!relatedEventId) {
      return NextResponse.json({ error: "Related event ID is required" }, { status: 400 })
    }

    if (!relationType) {
      return NextResponse.json({ error: "Relation type is required" }, { status: 400 })
    }

    if (relatedEventId === id) {
      return NextResponse.json({ error: "An event cannot be related to itself" }, { status: 400 })
    }

    const validRelationTypes = ["part_of", "caused_by", "led_to", "concurrent_with", "related_to"]
    if (!validRelationTypes.includes(relationType)) {
      return NextResponse.json({ error: "Invalid relation type" }, { status: 400 })
    }

    // Check if relation already exists
    const existing = await prisma.eventRelation.findUnique({
      where: {
        eventId_relatedEventId_relationType: {
          eventId: id,
          relatedEventId,
          relationType,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "This relation already exists" }, { status: 400 })
    }

    const eventRelation = await prisma.eventRelation.create({
      data: {
        eventId: id,
        relatedEventId,
        relationType,
      },
      include: {
        relatedEvent: {
          select: {
            id: true,
            title: true,
            eventType: true,
          },
        },
      },
    })

    return NextResponse.json(eventRelation)
  } catch (error) {
    console.error("Failed to add event relation:", error)
    return NextResponse.json({ error: "Failed to add event relation" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { relationId } = body

    if (!relationId) {
      return NextResponse.json({ error: "Relation ID is required" }, { status: 400 })
    }

    // Verify the relation belongs to this event (either as source or target)
    const relation = await prisma.eventRelation.findUnique({
      where: { id: relationId },
    })

    if (!relation || (relation.eventId !== id && relation.relatedEventId !== id)) {
      return NextResponse.json({ error: "Relation not found for this event" }, { status: 404 })
    }

    await prisma.eventRelation.delete({
      where: { id: relationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove event relation:", error)
    return NextResponse.json({ error: "Failed to remove event relation" }, { status: 500 })
  }
}

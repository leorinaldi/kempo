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

    const eventPeople = await prisma.eventPerson.findMany({
      where: { eventId: id },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            article: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(eventPeople)
  } catch (error) {
    console.error("Failed to list event people:", error)
    return NextResponse.json({ error: "Failed to list event people" }, { status: 500 })
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
    const { personId, role } = body

    if (!personId) {
      return NextResponse.json({ error: "Person ID is required" }, { status: 400 })
    }

    // Check if link already exists
    const existing = await prisma.eventPerson.findUnique({
      where: {
        eventId_personId: {
          eventId: id,
          personId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Person is already linked to this event" }, { status: 400 })
    }

    const eventPerson = await prisma.eventPerson.create({
      data: {
        eventId: id,
        personId,
        role: role || null,
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(eventPerson)
  } catch (error) {
    console.error("Failed to add person to event:", error)
    return NextResponse.json({ error: "Failed to add person to event" }, { status: 500 })
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
    const { personId } = body

    if (!personId) {
      return NextResponse.json({ error: "Person ID is required" }, { status: 400 })
    }

    await prisma.eventPerson.delete({
      where: {
        eventId_personId: {
          eventId: id,
          personId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove person from event:", error)
    return NextResponse.json({ error: "Failed to remove person from event" }, { status: 500 })
  }
}

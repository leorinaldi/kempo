import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Add an element to an audio file
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id: audioId } = await params
    const { itemId, itemType } = await request.json()

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "itemId and itemType are required" }, { status: 400 })
    }

    // Check if element already exists
    const existing = await prisma.audioElement.findFirst({
      where: { audioId, itemId, itemType },
    })

    if (existing) {
      return NextResponse.json({ error: "This link already exists" }, { status: 409 })
    }

    // Create the element
    await prisma.audioElement.create({
      data: { audioId, itemId, itemType },
    })

    // Return updated audio with elements
    const audio = await prisma.audio.findUnique({
      where: { id: audioId },
      include: { elements: true },
    })

    // Resolve person names
    const personIds = audio?.elements
      .filter((e) => e.itemType !== "album")
      .map((e) => e.itemId) || []

    const people = await prisma.person.findMany({
      where: { id: { in: personIds } },
      select: { id: true, firstName: true, lastName: true, nickname: true },
    })
    const personMap = Object.fromEntries(
      people.map((p) => [p.id, `${p.nickname || p.firstName} ${p.lastName}`])
    )

    // Resolve album names
    const albumIds = audio?.elements
      .filter((e) => e.itemType === "album")
      .map((e) => e.itemId) || []

    const albums = await prisma.album.findMany({
      where: { id: { in: albumIds } },
      select: { id: true, name: true },
    })
    const albumMap = Object.fromEntries(albums.map((a) => [a.id, a.name]))

    return NextResponse.json({
      ...audio,
      elements: audio?.elements.map((e) => ({
        id: e.id,
        itemId: e.itemId,
        itemType: e.itemType,
        itemName: e.itemType === "album"
          ? albumMap[e.itemId] || e.itemId
          : personMap[e.itemId] || e.itemId,
      })),
    })
  } catch (error) {
    console.error("Failed to add audio element:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add element" },
      { status: 500 }
    )
  }
}

// Remove an element from an audio file
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id: audioId } = await params
    const { elementId } = await request.json()

    if (!elementId) {
      return NextResponse.json({ error: "elementId is required" }, { status: 400 })
    }

    // Verify element belongs to this audio
    const element = await prisma.audioElement.findUnique({
      where: { id: elementId },
    })

    if (!element || element.audioId !== audioId) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 })
    }

    await prisma.audioElement.delete({
      where: { id: elementId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove audio element:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove element" },
      { status: 500 }
    )
  }
}

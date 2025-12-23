import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const audioFiles = await prisma.audio.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        elements: true,
      },
    })

    // Resolve person names for elements
    const personIds = audioFiles.flatMap((a) =>
      a.elements.filter((e) => e.itemType !== "album").map((e) => e.itemId)
    )
    const people = await prisma.person.findMany({
      where: { id: { in: personIds } },
      select: { id: true, firstName: true, lastName: true, nickname: true },
    })
    const personMap = Object.fromEntries(
      people.map((p) => [p.id, `${p.nickname || p.firstName} ${p.lastName}`])
    )

    // Resolve album names for elements
    const albumIds = audioFiles.flatMap((a) =>
      a.elements.filter((e) => e.itemType === "album").map((e) => e.itemId)
    )
    const albums = await prisma.album.findMany({
      where: { id: { in: albumIds } },
      select: { id: true, name: true },
    })
    const albumMap = Object.fromEntries(albums.map((a) => [a.id, a.name]))

    const result = audioFiles.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      url: a.url,
      type: a.type,
      description: a.description,
      duration: a.duration,
      kyDate: a.kyDate,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      elements: a.elements.map((e) => ({
        id: e.id,
        itemId: e.itemId,
        itemType: e.itemType,
        itemName: e.itemType === "album"
          ? albumMap[e.itemId] || e.itemId
          : personMap[e.itemId] || e.itemId,
      })),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to list audio:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list audio" },
      { status: 500 }
    )
  }
}

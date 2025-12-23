import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Album ID is required" }, { status: 400 })
    }

    // Check for linked audio elements
    const linkedElements = await prisma.audioElement.findMany({
      where: {
        itemId: id,
        itemType: "album",
      },
    })

    if (linkedElements.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${linkedElements.length} audio file(s) are linked to this album` },
        { status: 400 }
      )
    }

    await prisma.album.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete album:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete album" },
      { status: 500 }
    )
  }
}

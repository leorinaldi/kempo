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
      select: {
        id: true,
        slug: true,
        name: true,
        url: true,
        artist: true,
        artistSlug: true,
        description: true,
        kyDate: true,
        createdAt: true,
      },
    })

    return NextResponse.json(audioFiles)
  } catch (error) {
    console.error("Failed to list audio:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list audio" },
      { status: 500 }
    )
  }
}

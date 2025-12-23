import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const videoFiles = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        artist: true,
        artistId: true,
        artistPerson: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            stageName: true,
            articleId: true,
          }
        },
        description: true,
        duration: true,
        aspectRatio: true,
        width: true,
        height: true,
        kyDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(videoFiles)
  } catch (error) {
    console.error("Failed to list video:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list video" },
      { status: 500 }
    )
  }
}

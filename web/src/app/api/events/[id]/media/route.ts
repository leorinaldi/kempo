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

    const eventMedia = await prisma.eventMedia.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "asc" },
    })

    // Resolve media names based on type
    const resolvedMedia = await Promise.all(
      eventMedia.map(async (em) => {
        let mediaName = "Unknown"
        let mediaUrl: string | null = null

        switch (em.mediaType) {
          case "article": {
            const article = await prisma.article.findUnique({
              where: { id: em.mediaId },
              select: { title: true, id: true },
            })
            if (article) {
              mediaName = article.title
            }
            break
          }
          case "audio": {
            const audio = await prisma.audio.findUnique({
              where: { id: em.mediaId },
              select: { name: true, url: true },
            })
            if (audio) {
              mediaName = audio.name
              mediaUrl = audio.url
            }
            break
          }
          case "video": {
            const video = await prisma.video.findUnique({
              where: { id: em.mediaId },
              select: { name: true, url: true },
            })
            if (video) {
              mediaName = video.name
              mediaUrl = video.url
            }
            break
          }
          case "image": {
            const image = await prisma.image.findUnique({
              where: { id: em.mediaId },
              select: { name: true, url: true },
            })
            if (image) {
              mediaName = image.name
              mediaUrl = image.url
            }
            break
          }
          case "album": {
            const album = await prisma.album.findUnique({
              where: { id: em.mediaId },
              select: { name: true },
            })
            if (album) {
              mediaName = album.name
            }
            break
          }
        }

        return {
          ...em,
          mediaName,
          mediaUrl,
        }
      })
    )

    return NextResponse.json(resolvedMedia)
  } catch (error) {
    console.error("Failed to list event media:", error)
    return NextResponse.json({ error: "Failed to list event media" }, { status: 500 })
  }
}

// POST and DELETE will be added when we implement media linking in a future phase

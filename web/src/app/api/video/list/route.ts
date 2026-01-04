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
        type: true,
        description: true,
        duration: true,
        aspectRatio: true,
        width: true,
        height: true,
        kyDate: true,
        createdAt: true,
        updatedAt: true,
        // Genres
        genres: {
          select: {
            genre: { select: { id: true, name: true, slug: true } },
          },
        },
        // VideoElements (cast/crew)
        elements: {
          select: {
            id: true,
            role: true,
            credit: true,
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                stageName: true,
                articleId: true,
              },
            },
          },
        },
        // Type-specific metadata
        movieMetadata: {
          select: {
            id: true,
            releaseYear: true,
            runtime: true,
            studio: { select: { id: true, name: true } },
          },
        },
        trailerMetadata: {
          select: {
            id: true,
            trailerNumber: true,
            trailerType: { select: { id: true, name: true } },
            forMovie: { select: { id: true, name: true } },
            forSeries: { select: { id: true, title: true } },
          },
        },
        commercialMetadata: {
          select: {
            id: true,
            campaign: true,
            airYear: true,
            adType: { select: { id: true, name: true } },
            brand: { select: { id: true, name: true } },
            product: { select: { id: true, name: true } },
            agency: { select: { id: true, name: true } },
          },
        },
        tvEpisodeMetadata: {
          select: {
            id: true,
            seasonNum: true,
            episodeNum: true,
            episodeTitle: true,
            series: { select: { id: true, title: true } },
          },
        },
        onlineMetadata: {
          select: {
            id: true,
            contentType: { select: { id: true, name: true } },
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                stageName: true,
              },
            },
          },
        },
        // Platform assignments
        kempoTubeVideo: {
          select: {
            id: true,
            title: true,
            views: true,
            featured: true,
            publishedAt: true,
            channel: { select: { id: true, name: true } },
          },
        },
        flipFlopVideo: {
          select: {
            id: true,
            likes: true,
            featured: true,
            publishedAt: true,
            account: { select: { id: true, name: true } },
          },
        },
        tvBroadcasts: {
          select: {
            id: true,
            position: true,
            tvChannel: { select: { id: true, name: true, callSign: true } },
          },
        },
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

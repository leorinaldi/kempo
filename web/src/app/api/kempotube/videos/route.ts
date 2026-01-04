import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch KempoTube videos with video and channel data
    const kempoTubeVideos = await prisma.kempoTubeVideo.findMany({
      orderBy: { publishedAt: "desc" },
      include: {
        video: {
          select: {
            id: true,
            name: true,
            url: true,
            description: true,
            elements: {
              where: { role: "actor" },
              take: 1,
              select: {
                person: {
                  select: {
                    firstName: true,
                    lastName: true,
                    stageName: true,
                    articleId: true,
                  },
                },
                credit: true,
              },
            },
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Transform to the format expected by the frontend
    const items = kempoTubeVideos
      .filter((kt) => kt.video.url) // Only include videos with actual files
      .map((kt) => {
        const firstActor = kt.video.elements[0]
        const actorName = firstActor?.credit ||
          firstActor?.person.stageName ||
          (firstActor?.person ? `${firstActor.person.firstName} ${firstActor.person.lastName}` : "")

        return {
          id: kt.id,  // KempoTubeVideo ID for URLs
          videoId: kt.video.id,
          name: kt.title || kt.video.name, // Use override title if set
          description: kt.video.description || "",
          url: kt.video.url,
          artist: actorName,
          artistArticleId: firstActor?.person.articleId || "",
          channelId: kt.channel.id,
          channelName: kt.channel.name,
          views: kt.views,
          featured: kt.featured,
        }
      })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch KempoTube videos:", error)
    return NextResponse.json([])
  }
}

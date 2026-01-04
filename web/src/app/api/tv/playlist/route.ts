import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch all TV channels with their broadcasts
    const channels = await prisma.tvChannel.findMany({
      orderBy: { callSign: "asc" },
      include: {
        broadcasts: {
          orderBy: { position: "asc" },
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
          },
        },
      },
    })

    // Transform to the format expected by the frontend
    const result = channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      callSign: channel.callSign || channel.name,
      videos: channel.broadcasts
        .filter((b) => b.video.url) // Only include videos with actual files
        .map((broadcast) => {
          const firstActor = broadcast.video.elements[0]
          const actorName = firstActor?.credit ||
            firstActor?.person.stageName ||
            (firstActor?.person ? `${firstActor.person.firstName} ${firstActor.person.lastName}` : "")

          return {
            id: broadcast.video.id,
            name: broadcast.video.name,
            description: broadcast.video.description || "",
            url: broadcast.video.url,
            artist: actorName,
            artistArticleId: firstActor?.person.articleId || "",
          }
        }),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch TV channels:", error)
    return NextResponse.json([])
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch FlipFlop videos with video and account data
    const flipFlopVideos = await prisma.flipFlopVideo.findMany({
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
        account: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    })

    // Transform to include articleId from Person relation
    const items = flipFlopVideos
      .filter((ff) => ff.video.url) // Only include videos with actual files
      .map((ff) => {
        const firstActor = ff.video.elements[0]
        const actorName = firstActor?.credit ||
          firstActor?.person.stageName ||
          (firstActor?.person ? `${firstActor.person.firstName} ${firstActor.person.lastName}` : "")

        return {
          id: ff.id,  // FlipFlopVideo ID for URLs
          videoId: ff.video.id,
          name: ff.video.name,
          url: ff.video.url,
          description: ff.video.description,
          artist: actorName,
          artistArticleId: firstActor?.person.articleId || "",
          accountId: ff.account.id,
          accountName: ff.account.name,
          accountDisplayName: ff.account.displayName,
          likes: ff.likes,
        }
      })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch FlipFlop videos:", error)
    return NextResponse.json([])
  }
}

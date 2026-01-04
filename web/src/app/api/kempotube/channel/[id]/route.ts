import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const channel = await prisma.kempoTubeChannel.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: { publishedAt: "desc" },
          include: {
            video: {
              select: {
                id: true,
                name: true,
                url: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      avatarUrl: channel.avatarUrl,
      bannerUrl: channel.bannerUrl,
      websiteUrl: channel.websiteUrl,
      websiteName: channel.websiteName,
      videos: channel.videos
        .filter((v) => v.video.url)
        .map((v) => ({
          id: v.id,  // KempoTubeVideo ID
          name: v.title || v.video.name,
          url: v.video.url,
          description: v.video.description,
          views: v.views,
          publishedAt: v.publishedAt,
        })),
    })
  } catch (error) {
    console.error("Failed to fetch KempoTube channel:", error)
    return NextResponse.json(
      { error: "Failed to fetch channel" },
      { status: 500 }
    )
  }
}

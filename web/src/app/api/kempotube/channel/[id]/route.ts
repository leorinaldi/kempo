import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseKYDateParam } from "@/lib/ky-date-filter"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Parse KY date filter from query params
    const { searchParams } = new URL(request.url)
    const maxDate = parseKYDateParam(searchParams.get("ky"))

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
                kyDate: true,
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
        .filter((v) => {
          if (!v.video.url) return false
          if (maxDate && v.video.kyDate && v.video.kyDate > maxDate) return false
          return true
        })
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

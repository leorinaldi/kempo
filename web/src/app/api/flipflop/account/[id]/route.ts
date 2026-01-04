import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const account = await prisma.flipFlopAccount.findUnique({
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
              },
            },
          },
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: account.id,
      name: account.name,
      displayName: account.displayName,
      bio: account.bio,
      profilePictureUrl: account.profilePictureUrl,
      websiteUrl: account.websiteUrl,
      websiteName: account.websiteName,
      videos: account.videos
        .filter((v) => v.video.url)
        .map((v) => ({
          id: v.id,  // FlipFlopVideo ID for URLs
          name: v.video.name,
          url: v.video.url,
          likes: v.likes,
          publishedAt: v.publishedAt,
        })),
    })
  } catch (error) {
    console.error("Failed to fetch FlipFlop account:", error)
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    )
  }
}

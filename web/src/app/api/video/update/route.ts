import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { VideoType } from "@prisma/client"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      id,
      name,
      description,
      type,
      aspectRatio,
      kyDate,
      genreIds,
      // Movie metadata
      studioId,
      releaseYear,
      runtime,
      // Trailer metadata
      trailerTypeId,
      trailerNumber,
      forMovieId,
      forSeriesId,
      // Commercial metadata
      brandId,
      productId,
      agencyId,
      adTypeId,
      campaign,
      airYear,
      // TV Episode metadata
      seriesId,
      seasonNum,
      episodeNum,
      episodeTitle,
      // Online metadata
      creatorId,
      contentTypeId,
      // Platform assignments
      kempoTubeChannelId,
      flipFlopAccountId,
      tvChannelId,
      removeKempoTube,
      removeFlipFlop,
      removeTv,
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Get current video to check for type changes
    const currentVideo = await prisma.video.findUnique({
      where: { id },
      select: { type: true },
    })

    if (!currentVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const videoType = (type as VideoType) || currentVideo.type

    // Update base video
    await prisma.video.update({
      where: { id },
      data: {
        name,
        description: description || null,
        type: videoType,
        aspectRatio: aspectRatio || null,
        kyDate: kyDate ? new Date(kyDate) : null,
      },
    })

    // Update genres if provided
    if (genreIds !== undefined) {
      await prisma.videoGenre.deleteMany({ where: { videoId: id } })
      if (genreIds.length > 0) {
        await prisma.videoGenre.createMany({
          data: genreIds.map((genreId: string) => ({
            videoId: id,
            genreId,
          })),
        })
      }
    }

    // Handle type-specific metadata
    // Delete old metadata if type changed
    if (type && type !== currentVideo.type) {
      await prisma.movieMetadata.deleteMany({ where: { videoId: id } })
      await prisma.trailerMetadata.deleteMany({ where: { videoId: id } })
      await prisma.commercialMetadata.deleteMany({ where: { videoId: id } })
      await prisma.tvEpisodeMetadata.deleteMany({ where: { videoId: id } })
      await prisma.onlineMetadata.deleteMany({ where: { videoId: id } })
    }

    // Create/update type-specific metadata
    if (videoType === "movie") {
      await prisma.movieMetadata.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          studioId: studioId || null,
          releaseYear: releaseYear ? parseInt(releaseYear) : null,
          runtime: runtime ? parseInt(runtime) : null,
        },
        update: {
          studioId: studioId || null,
          releaseYear: releaseYear ? parseInt(releaseYear) : null,
          runtime: runtime ? parseInt(runtime) : null,
        },
      })
    } else if (videoType === "trailer" && trailerTypeId) {
      await prisma.trailerMetadata.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          trailerTypeId,
          trailerNumber: trailerNumber ? parseInt(trailerNumber) : null,
          forMovieId: forMovieId || null,
          forSeriesId: forSeriesId || null,
        },
        update: {
          trailerTypeId,
          trailerNumber: trailerNumber ? parseInt(trailerNumber) : null,
          forMovieId: forMovieId || null,
          forSeriesId: forSeriesId || null,
        },
      })
    } else if (videoType === "commercial" && adTypeId) {
      await prisma.commercialMetadata.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          adTypeId,
          brandId: brandId || null,
          productId: productId || null,
          agencyId: agencyId || null,
          campaign: campaign || null,
          airYear: airYear ? parseInt(airYear) : null,
        },
        update: {
          adTypeId,
          brandId: brandId || null,
          productId: productId || null,
          agencyId: agencyId || null,
          campaign: campaign || null,
          airYear: airYear ? parseInt(airYear) : null,
        },
      })
    } else if (videoType === "tvShow" && seriesId) {
      await prisma.tvEpisodeMetadata.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          seriesId,
          seasonNum: seasonNum ? parseInt(seasonNum) : 1,
          episodeNum: episodeNum ? parseInt(episodeNum) : 1,
          episodeTitle: episodeTitle || "Untitled",
        },
        update: {
          seriesId,
          seasonNum: seasonNum ? parseInt(seasonNum) : 1,
          episodeNum: episodeNum ? parseInt(episodeNum) : 1,
          episodeTitle: episodeTitle || "Untitled",
        },
      })
    } else if (videoType === "online" && contentTypeId) {
      await prisma.onlineMetadata.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          contentTypeId,
          creatorId: creatorId || null,
        },
        update: {
          contentTypeId,
          creatorId: creatorId || null,
        },
      })
    }

    // Handle platform assignments
    if (removeKempoTube) {
      await prisma.kempoTubeVideo.deleteMany({ where: { videoId: id } })
    } else if (kempoTubeChannelId) {
      await prisma.kempoTubeVideo.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          channelId: kempoTubeChannelId,
        },
        update: {
          channelId: kempoTubeChannelId,
        },
      })
    }

    if (removeFlipFlop) {
      await prisma.flipFlopVideo.deleteMany({ where: { videoId: id } })
    } else if (flipFlopAccountId) {
      await prisma.flipFlopVideo.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          accountId: flipFlopAccountId,
        },
        update: {
          accountId: flipFlopAccountId,
        },
      })
    }

    if (removeTv) {
      await prisma.tvBroadcast.deleteMany({ where: { videoId: id } })
    } else if (tvChannelId) {
      // Check if already on this channel
      const existing = await prisma.tvBroadcast.findFirst({
        where: { videoId: id, tvChannelId },
      })
      if (!existing) {
        // Remove from other channels and add to new one
        await prisma.tvBroadcast.deleteMany({ where: { videoId: id } })
        const lastBroadcast = await prisma.tvBroadcast.findFirst({
          where: { tvChannelId },
          orderBy: { position: "desc" },
        })
        await prisma.tvBroadcast.create({
          data: {
            videoId: id,
            tvChannelId,
            position: (lastBroadcast?.position ?? 0) + 1,
          },
        })
      }
    }

    // Fetch updated video
    const updated = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update video:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update video" },
      { status: 500 }
    )
  }
}

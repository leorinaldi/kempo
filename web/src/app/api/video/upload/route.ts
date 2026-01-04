import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { VideoType } from "@prisma/client"

// Calculate aspectRatio from actual dimensions (overrides user selection)
function getAspectRatioFromDimensions(width: number | null, height: number | null): string | null {
  if (!width || !height) return null
  const ratio = width / height
  if (ratio > 1.2) return "landscape"
  if (ratio < 0.8) return "portrait"
  return "square"
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null
    const description = formData.get("description") as string | null
    const videoTypeStr = formData.get("videoType") as string | null
    const genreIdsStr = formData.get("genreIds") as string | null
    const widthStr = formData.get("width") as string | null
    const heightStr = formData.get("height") as string | null
    const durationStr = formData.get("duration") as string | null

    // Type-specific fields
    // Movie
    const studioId = formData.get("studioId") as string | null
    const releaseYearStr = formData.get("releaseYear") as string | null
    const runtimeStr = formData.get("runtime") as string | null

    // Trailer
    const trailerTypeId = formData.get("trailerTypeId") as string | null
    const trailerNumberStr = formData.get("trailerNumber") as string | null
    const forMovieId = formData.get("forMovieId") as string | null
    const forSeriesId = formData.get("forSeriesId") as string | null

    // Commercial
    const brandId = formData.get("brandId") as string | null
    const productId = formData.get("productId") as string | null
    const agencyId = formData.get("agencyId") as string | null
    const adTypeId = formData.get("adTypeId") as string | null
    const campaign = formData.get("campaign") as string | null
    const airYearStr = formData.get("airYear") as string | null

    // TV Show
    const seriesId = formData.get("seriesId") as string | null
    const seasonNumStr = formData.get("seasonNum") as string | null
    const episodeNumStr = formData.get("episodeNum") as string | null
    const episodeTitle = formData.get("episodeTitle") as string | null

    // Online
    const creatorId = formData.get("creatorId") as string | null
    const contentTypeId = formData.get("contentTypeId") as string | null

    // Platform assignments
    const kempoTubeChannelId = formData.get("kempoTubeChannelId") as string | null
    const flipFlopAccountId = formData.get("flipFlopAccountId") as string | null
    const tvChannelId = formData.get("tvChannelId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Determine file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "mp4"

    // Parse width/height/duration if provided
    const width = widthStr ? parseInt(widthStr, 10) : null
    const height = heightStr ? parseInt(heightStr, 10) : null
    const duration = durationStr ? parseFloat(durationStr) : null

    // Calculate aspectRatio from actual dimensions
    const calculatedAspectRatio = getAspectRatioFromDimensions(width, height) || "landscape"

    // Validate video type
    const videoType = (videoTypeStr as VideoType) || "online"

    // Parse genre IDs
    let genreIds: string[] = []
    if (genreIdsStr) {
      try {
        genreIds = JSON.parse(genreIdsStr)
      } catch {
        // Ignore parse errors
      }
    }

    // Create database entry first to get the ID
    const video = await prisma.video.create({
      data: {
        name: title,
        url: "", // Temporary, will be updated after blob upload
        type: videoType,
        description: description || null,
        duration: duration || null,
        width: width || null,
        height: height || null,
        aspectRatio: calculatedAspectRatio,
      },
    })

    // Upload to Vercel Blob using ID-based path
    const blob = await put(
      `kempo-media/video/${video.id}.${extension}`,
      file,
      { access: "public" }
    )

    // Update database with the blob URL
    await prisma.video.update({
      where: { id: video.id },
      data: { url: blob.url },
    })

    // Create genre assignments
    if (genreIds.length > 0) {
      await prisma.videoGenre.createMany({
        data: genreIds.map((genreId) => ({
          videoId: video.id,
          genreId,
        })),
      })
    }

    // Create type-specific metadata
    if (videoType === "movie") {
      await prisma.movieMetadata.create({
        data: {
          videoId: video.id,
          studioId: studioId || null,
          releaseYear: releaseYearStr ? parseInt(releaseYearStr, 10) : null,
          runtime: runtimeStr ? parseInt(runtimeStr, 10) : null,
        },
      })
    } else if (videoType === "trailer" && trailerTypeId) {
      await prisma.trailerMetadata.create({
        data: {
          videoId: video.id,
          trailerTypeId,
          trailerNumber: trailerNumberStr ? parseInt(trailerNumberStr, 10) : null,
          forMovieId: forMovieId || null,
          forSeriesId: forSeriesId || null,
        },
      })
    } else if (videoType === "commercial" && adTypeId) {
      await prisma.commercialMetadata.create({
        data: {
          videoId: video.id,
          adTypeId,
          brandId: brandId || null,
          productId: productId || null,
          agencyId: agencyId || null,
          campaign: campaign || null,
          airYear: airYearStr ? parseInt(airYearStr, 10) : null,
        },
      })
    } else if (videoType === "tvShow" && seriesId) {
      await prisma.tvEpisodeMetadata.create({
        data: {
          videoId: video.id,
          seriesId,
          seasonNum: seasonNumStr ? parseInt(seasonNumStr, 10) : 1,
          episodeNum: episodeNumStr ? parseInt(episodeNumStr, 10) : 1,
          episodeTitle: episodeTitle || "Untitled",
        },
      })
    } else if (videoType === "online" && contentTypeId) {
      await prisma.onlineMetadata.create({
        data: {
          videoId: video.id,
          contentTypeId,
          creatorId: creatorId || null,
        },
      })
    }

    // Create platform assignments
    if (kempoTubeChannelId) {
      await prisma.kempoTubeVideo.create({
        data: {
          videoId: video.id,
          channelId: kempoTubeChannelId,
        },
      })
    }

    if (flipFlopAccountId) {
      await prisma.flipFlopVideo.create({
        data: {
          videoId: video.id,
          accountId: flipFlopAccountId,
        },
      })
    }

    if (tvChannelId) {
      // Get the next position for this channel
      const lastBroadcast = await prisma.tvBroadcast.findFirst({
        where: { tvChannelId },
        orderBy: { position: "desc" },
      })
      const nextPosition = (lastBroadcast?.position ?? 0) + 1

      await prisma.tvBroadcast.create({
        data: {
          videoId: video.id,
          tvChannelId,
          position: nextPosition,
        },
      })
    }

    return NextResponse.json({
      success: true,
      id: video.id,
      url: blob.url,
      title,
      type: videoType,
      filename: `${video.id}.${extension}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}

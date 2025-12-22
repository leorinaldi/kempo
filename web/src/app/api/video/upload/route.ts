import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir, access } from "fs/promises"
import path from "path"

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
    const slug = formData.get("slug") as string | null
    const description = formData.get("description") as string | null
    const artist = formData.get("artist") as string | null
    const artistSlug = formData.get("artistSlug") as string | null
    const aspectRatio = formData.get("aspectRatio") as string | null
    const widthStr = formData.get("width") as string | null
    const heightStr = formData.get("height") as string | null
    const durationStr = formData.get("duration") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title || !slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await prisma.video.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: `A video file with slug "${slug}" already exists. Please choose a different slug.` },
        { status: 409 }
      )
    }

    // Check if a Kempopedia article already exists at this slug
    const articlesBase = path.join(process.cwd(), "content", "articles")
    const categories = ["culture", "people", "places", "companies", "concepts", "events", "institutions", "products", "timelines"]

    for (const category of categories) {
      const articlePath = path.join(articlesBase, category, `${slug}.md`)
      try {
        await access(articlePath)
        return NextResponse.json(
          { error: `A Kempopedia article already exists at "${slug}" (in ${category}). Please choose a different slug.` },
          { status: 409 }
        )
      } catch {
        // File doesn't exist, continue
      }
    }

    // Determine file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "mp4"

    // Parse width/height/duration if provided
    const width = widthStr ? parseInt(widthStr, 10) : null
    const height = heightStr ? parseInt(heightStr, 10) : null
    const duration = durationStr ? parseFloat(durationStr) : null

    // Calculate aspectRatio from actual dimensions (overrides user selection)
    const calculatedAspectRatio = getAspectRatioFromDimensions(width, height) || aspectRatio || "landscape"

    // Create database entry first to get the ID
    const video = await prisma.video.create({
      data: {
        slug,
        name: title,
        url: "", // Temporary, will be updated after blob upload
        description: description || null,
        artist: artist || null,
        artistSlug: artistSlug || null,
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

    // Generate Kempopedia article
    try {
      const articlesDir = path.join(process.cwd(), "content", "articles", "culture")
      await mkdir(articlesDir, { recursive: true })

      const articlePath = path.join(articlesDir, `${slug}.md`)
      const articleContent = generateVideoArticle({
        title,
        slug,
        description: description || undefined,
        artist: artist || undefined,
        artistSlug: artistSlug || undefined,
        mediaUrl: blob.url,
      })

      await writeFile(articlePath, articleContent, "utf-8")
    } catch (articleError) {
      console.error("Failed to create Kempopedia article:", articleError)
    }

    return NextResponse.json({
      success: true,
      id: video.id,
      url: blob.url,
      title,
      slug,
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

interface ArticleParams {
  title: string
  slug: string
  description?: string
  artist?: string
  artistSlug?: string
  mediaUrl: string
}

function generateVideoArticle(params: ArticleParams): string {
  const { title, slug, description, artist, artistSlug, mediaUrl } = params

  const frontmatter = `---
title: "${title}"
slug: "${slug}"
type: culture
subtype: video
status: published
tags:
  - video
---`

  const infoboxFields: Record<string, string> = {
    Title: title,
  }

  if (artist && artistSlug) {
    infoboxFields.Creator = `[[${artistSlug}|${artist}]]`
  }

  const infobox = {
    infobox: {
      type: "video",
      fields: infoboxFields,
    },
    media: [
      {
        type: "video",
        url: mediaUrl,
      },
    ],
  }

  let intro = `"**${title}**"`
  if (artist && artistSlug) {
    intro += ` is a video by [[${artistSlug}|${artist}]].`
  } else {
    intro += ` is a video.`
  }

  if (description) {
    intro += ` ${description}`
  }

  const seeAlso: string[] = []
  if (artistSlug && artist) {
    seeAlso.push(`- [[${artistSlug}|${artist}]]`)
  }

  const seeAlsoSection = seeAlso.length > 0
    ? `\n## See also\n\n${seeAlso.join("\n")}\n`
    : ""

  return `${frontmatter}

\`\`\`json
${JSON.stringify(infobox, null, 2)}
\`\`\`

${intro}
${seeAlsoSection}`
}

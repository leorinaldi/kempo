import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir, access } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  // Check authentication
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
    const mediaType = formData.get("mediaType") as string | null
    const description = formData.get("description") as string | null
    const artist = formData.get("artist") as string | null
    const artistSlug = formData.get("artistSlug") as string | null
    const aspectRatio = formData.get("aspectRatio") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title || !slug || !mediaType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if a Kempopedia article already exists at this slug (in any category)
    const articlesBase = path.join(process.cwd(), "content", "articles")
    const categories = ["culture", "people", "places", "companies", "concepts", "events", "institutions", "products", "timelines"]

    for (const category of categories) {
      const articlePath = path.join(articlesBase, category, `${slug}.md`)
      try {
        await access(articlePath)
        // If we get here, the file exists
        return NextResponse.json(
          { error: `A Kempopedia article already exists at "${slug}" (in ${category}). Please choose a different slug.` },
          { status: 409 }
        )
      } catch {
        // File doesn't exist in this category, continue checking
      }
    }

    // Determine file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin"

    // Auto-detect media type based on file extension
    const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv", "m4v"]
    const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac", "m4a"]

    let actualMediaType = mediaType
    if (videoExtensions.includes(extension)) {
      actualMediaType = "video"
    } else if (audioExtensions.includes(extension)) {
      actualMediaType = "audio"
    }

    // Upload to Vercel Blob
    const blob = await put(
      `kempo-media/${actualMediaType}/${slug}.${extension}`,
      file,
      { access: "public" }
    )

    // Create database entry with blob URL
    const media = await prisma.media.create({
      data: {
        slug,
        name: title,
        type: actualMediaType,
        url: blob.url,
        description: description || null,
        artist: artist || null,
        artistSlug: artistSlug || null,
        aspectRatio: actualMediaType === "video" ? (aspectRatio || "landscape") : null,
      },
    })

    // Generate Kempopedia article
    try {
      const articlesDir = path.join(process.cwd(), "content", "articles", "culture")
      await mkdir(articlesDir, { recursive: true })

      const articlePath = path.join(articlesDir, `${slug}.md`)
      const articleContent = generateArticleContent({
        title,
        slug,
        mediaType: actualMediaType,
        description: description || undefined,
        artist: artist || undefined,
        artistSlug: artistSlug || undefined,
        mediaUrl: blob.url,
      })

      await writeFile(articlePath, articleContent, "utf-8")
    } catch (articleError) {
      // Log but don't fail the upload if article creation fails
      console.error("Failed to create Kempopedia article:", articleError)
    }

    return NextResponse.json({
      success: true,
      id: media.id,
      url: blob.url,
      title,
      slug,
      mediaType: actualMediaType,
      description,
      filename: `${slug}.${extension}`,
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
  mediaType: string
  description?: string
  artist?: string
  artistSlug?: string
  mediaUrl: string
}

function generateArticleContent(params: ArticleParams): string {
  const { title, slug, mediaType, description, artist, artistSlug, mediaUrl } = params

  const isAudio = mediaType === "audio"
  const subtype = isAudio ? "song" : "video"

  // Build frontmatter
  const frontmatter = `---
title: "${title}"
slug: "${slug}"
type: culture
subtype: ${subtype}
status: published
tags:
  - ${isAudio ? "music" : "video"}
  - ${subtype}
---`

  // Build infobox
  const infoboxFields: Record<string, string> = {
    Title: title,
  }

  if (artist && artistSlug) {
    infoboxFields.Artist = `[[${artistSlug}|${artist}]]`
  }

  const infobox = {
    infobox: {
      type: subtype,
      fields: infoboxFields,
    },
    media: [
      {
        type: mediaType,
        url: mediaUrl,
      },
    ],
  }

  // Build intro paragraph
  let intro = `"**${title}**"`
  if (isAudio && artist && artistSlug) {
    intro += ` is a song by [[${artistSlug}|${artist}]].`
  } else if (isAudio) {
    intro += ` is a song.`
  } else {
    intro += ` is a video.`
  }

  if (description) {
    intro += ` ${description}`
  }

  // Build see also section
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

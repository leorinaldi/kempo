import { auth } from "@/auth"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")

  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 })
  }

  try {
    const articlesDir = path.join(process.cwd(), "content", "articles")
    const result = searchArticlesForTrack(articlesDir, slug)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to lookup track:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to lookup track" },
      { status: 500 }
    )
  }
}

function searchArticlesForTrack(
  dir: string,
  slug: string
): { name: string; artist: string } {
  const result = { name: "", artist: "" }

  // First, try to find an article with matching slug in culture folder
  const cultureDir = path.join(dir, "culture")
  if (fs.existsSync(cultureDir)) {
    const files = fs.readdirSync(cultureDir)
    for (const file of files) {
      if (!file.endsWith(".md")) continue

      const fileSlug = file.replace(".md", "")
      // Check if this file matches the slug (exact match or contains the slug)
      if (fileSlug === slug || slug.includes(fileSlug) || fileSlug.includes(slug)) {
        const filePath = path.join(cultureDir, file)
        const content = fs.readFileSync(filePath, "utf-8")
        const { data } = matter(content)

        if (data.title) {
          result.name = data.title
        }

        // Look for artist in frontmatter
        if (data.artist) {
          result.artist = data.artist
        } else if (data.performer) {
          result.artist = data.performer
        } else if (data.by) {
          result.artist = data.by
        }

        // Try to extract artist from JSON infobox in content
        if (!result.artist) {
          const artistFromInfobox = extractArtistFromInfobox(content)
          if (artistFromInfobox) {
            result.artist = artistFromInfobox
          }
        }

        // If we found a match, return it
        if (result.name) {
          return result
        }
      }
    }
  }

  // Search all articles for references to this audio file
  const allFiles = getAllMarkdownFiles(dir)
  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, "utf-8")

    // Check if this article references the audio file
    if (content.includes(slug)) {
      const { data } = matter(content)

      // If this is a song/album article
      if (data.type === "song" || data.type === "album" || data.category === "culture" || data.subtype === "song") {
        if (data.title && !result.name) {
          result.name = data.title
        }
        if ((data.artist || data.performer || data.by) && !result.artist) {
          result.artist = data.artist || data.performer || data.by
        }

        // Try to extract artist from JSON infobox
        if (!result.artist) {
          const artistFromInfobox = extractArtistFromInfobox(content)
          if (artistFromInfobox) {
            result.artist = artistFromInfobox
          }
        }
      }

      if (result.name && result.artist) {
        return result
      }
    }
  }

  return result
}

function extractArtistFromInfobox(content: string): string | null {
  // Look for JSON infobox with Artist field
  const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/)
  if (jsonMatch) {
    try {
      const jsonData = JSON.parse(jsonMatch[1])
      if (jsonData.infobox?.fields?.Artist) {
        // Artist might be a wiki link like "[[frank-martino|Frank Martino]]"
        const artistField = jsonData.infobox.fields.Artist
        const linkMatch = artistField.match(/\[\[[^\|]+\|([^\]]+)\]\]/)
        if (linkMatch) {
          return linkMatch[1]
        }
        return artistField
      }
    } catch {
      // JSON parse failed, try regex
    }
  }

  // Fallback: try to extract from "Artist": "..." pattern
  const artistMatch = content.match(/"Artist"\s*:\s*"(?:\[\[[^\|]+\|)?([^\]"]+)/)
  if (artistMatch) {
    return artistMatch[1]
  }

  return null
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath))
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath)
    }
  }

  return files
}

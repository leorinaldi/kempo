import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface SearchResult {
  slug: string
  title: string
  type: string
  snippet: string
  rank: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    // Escape special characters and format for tsquery
    // Convert spaces to & for AND matching
    const sanitizedQuery = query
      .replace(/[^\w\s]/g, " ") // Remove special chars
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word + ":*") // Prefix matching
      .join(" & ")

    if (!sanitizedQuery) {
      return NextResponse.json([])
    }

    // PostgreSQL full-text search across title and content
    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT
        slug,
        title,
        type,
        LEFT(content, 200) as snippet,
        ts_rank(
          setweight(to_tsvector('english', title), 'A') ||
          setweight(to_tsvector('english', COALESCE(content, '')), 'B'),
          to_tsquery('english', ${sanitizedQuery})
        ) as rank
      FROM articles
      WHERE
        status = 'published'
        AND (
          to_tsvector('english', title) @@ to_tsquery('english', ${sanitizedQuery})
          OR to_tsvector('english', COALESCE(content, '')) @@ to_tsquery('english', ${sanitizedQuery})
        )
      ORDER BY rank DESC
      LIMIT 5
    `

    // Clean up snippets - remove markdown and truncate nicely
    const cleanedResults = results.map(result => ({
      ...result,
      snippet: cleanSnippet(result.snippet, query),
      url: `/kemponet/kempopedia/wiki/${result.slug}`,
    }))

    return NextResponse.json(cleanedResults)
  } catch (error) {
    console.error("Search error:", error)

    // Fallback to simple ILIKE search if full-text search fails
    try {
      const fallbackResults = await prisma.article.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          slug: true,
          title: true,
          type: true,
          content: true,
        },
        take: 5,
      })

      const cleanedResults = fallbackResults.map(result => ({
        slug: result.slug,
        title: result.title,
        type: result.type,
        snippet: cleanSnippet(result.content.slice(0, 200), query),
        url: `/kemponet/kempopedia/wiki/${result.slug}`,
        rank: 1,
      }))

      return NextResponse.json(cleanedResults)
    } catch (fallbackError) {
      console.error("Fallback search error:", fallbackError)
      return NextResponse.json([])
    }
  }
}

function cleanSnippet(text: string, query: string): string {
  // Remove markdown syntax
  let clean = text
    .replace(/#{1,6}\s/g, "") // Headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
    .replace(/\*([^*]+)\*/g, "$1") // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1") // Wiki links
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/\n+/g, " ") // Newlines to spaces
    .replace(/\s+/g, " ") // Multiple spaces
    .trim()

  // Try to find a relevant snippet around the query term
  const lowerClean = clean.toLowerCase()
  const lowerQuery = query.toLowerCase().split(/\s+/)[0] // First word of query
  const queryIndex = lowerClean.indexOf(lowerQuery)

  if (queryIndex > 50) {
    // Start snippet near the query match
    const startIndex = Math.max(0, queryIndex - 50)
    clean = "..." + clean.slice(startIndex)
  }

  // Truncate to ~150 chars at word boundary
  if (clean.length > 150) {
    clean = clean.slice(0, 150).replace(/\s+\S*$/, "") + "..."
  }

  return clean
}

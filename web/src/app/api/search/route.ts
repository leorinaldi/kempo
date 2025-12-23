import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface SearchResult {
  id: string
  title: string
  type: string
  snippet: string
  url: string
  domain: string
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

    // PostgreSQL full-text search across articles, pages, and app_search using UNION
    const results = await prisma.$queryRaw<SearchResult[]>`
      (
        SELECT
          id,
          title,
          type,
          LEFT(content, 200) as snippet,
          '/kemponet/kempopedia/wiki/' || id as url,
          'kempopedia' as domain,
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
      )
      UNION ALL
      (
        SELECT
          p.id,
          p.title,
          'page' as type,
          LEFT(p.content, 200) as snippet,
          '/kemponet/' || d.name || CASE WHEN p.slug = '' THEN '' ELSE '/' || p.slug END as url,
          d.name as domain,
          ts_rank(
            setweight(to_tsvector('english', p.title), 'A') ||
            setweight(to_tsvector('english', COALESCE(p.content, '')), 'B'),
            to_tsquery('english', ${sanitizedQuery})
          ) as rank
        FROM pages p
        JOIN domains d ON p.domain_id = d.id
        WHERE
          p.searchable = true
          AND (
            to_tsvector('english', p.title) @@ to_tsquery('english', ${sanitizedQuery})
            OR to_tsvector('english', COALESCE(p.content, '')) @@ to_tsquery('english', ${sanitizedQuery})
          )
      )
      UNION ALL
      (
        SELECT
          id,
          title,
          'app' as type,
          excerpt as snippet,
          path as url,
          domain,
          ts_rank(
            setweight(to_tsvector('english', title), 'A') ||
            setweight(to_tsvector('english', COALESCE(excerpt, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(content, '')), 'B'),
            to_tsquery('english', ${sanitizedQuery})
          ) as rank
        FROM app_search
        WHERE
          no_search = false
          AND (
            to_tsvector('english', title) @@ to_tsquery('english', ${sanitizedQuery})
            OR to_tsvector('english', COALESCE(excerpt, '')) @@ to_tsquery('english', ${sanitizedQuery})
            OR to_tsvector('english', COALESCE(content, '')) @@ to_tsquery('english', ${sanitizedQuery})
          )
      )
      ORDER BY rank DESC
      LIMIT 10
    `

    // Clean up snippets - remove markdown and truncate nicely
    const cleanedResults = results.map(result => ({
      ...result,
      snippet: cleanSnippet(result.snippet, query),
    }))

    return NextResponse.json(cleanedResults)
  } catch (error) {
    console.error("Search error:", error)

    // Fallback to simple ILIKE search if full-text search fails
    try {
      const articleResults = await prisma.article.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          type: true,
          content: true,
        },
        take: 5,
      })

      const pageResults = await prisma.page.findMany({
        where: {
          searchable: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          domain: {
            select: { name: true }
          }
        },
        take: 5,
      })

      const cleanedArticles = articleResults.map(result => ({
        id: result.id,
        title: result.title,
        type: result.type,
        snippet: cleanSnippet(result.content.slice(0, 200), query),
        url: `/kemponet/kempopedia/wiki/${result.id}`,
        domain: 'kempopedia',
        rank: 1,
      }))

      const cleanedPages = pageResults.map(result => ({
        id: result.id,
        title: result.title,
        type: 'page',
        snippet: cleanSnippet(result.content.slice(0, 200), query),
        url: `/kemponet/${result.domain.name}${result.slug ? '/' + result.slug : ''}`,
        domain: result.domain.name,
        rank: 1,
      }))

      const appResults = await prisma.appSearch.findMany({
        where: {
          noSearch: false,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      })

      const cleanedApps = appResults.map(result => ({
        id: result.id,
        title: result.title,
        type: 'app',
        snippet: result.excerpt,
        url: result.path,
        domain: result.domain,
        rank: 1,
      }))

      return NextResponse.json([...cleanedArticles, ...cleanedPages, ...cleanedApps].slice(0, 10))
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

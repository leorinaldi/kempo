import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getKYDateFromCookie } from "@/lib/ky-date"
import { slugify } from "@/lib/articles"

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

  // Get viewing date from cookie for temporal filtering
  const viewingDate = await getKYDateFromCookie()
  // Build the date filter for articles (null publish_date = always visible)
  let dateFilterParam: Date | null = null
  if (viewingDate) {
    // Create date for end of the viewing month
    dateFilterParam = new Date(viewingDate.year, viewingDate.month - 1, 28, 23, 59, 59)
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
    // Calculate each weight class separately and add them to prevent dilution:
    //   A (title)   = 1.0
    //   B (content) = 0.2
    //   C (unused)  = 0.1  -- reserved for future use
    //   D (unused)  = 0.05 -- reserved for future use
    // 2x bonus multiplier for title matches
    // Use different queries based on whether we have a date filter
    const results = dateFilterParam
      ? await prisma.$queryRaw<SearchResult[]>`
      (
        SELECT
          id,
          title,
          type,
          LEFT(content, 200) as snippet,
          '/kemponet/kempopedia/wiki/' || id as url,
          'kempopedia' as domain,
          (
            ts_rank(to_tsvector('english', title), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(content, '')), to_tsquery('english', ${sanitizedQuery})) * 0.2
          ) * CASE WHEN title ILIKE '%' || ${query} || '%' THEN 2 ELSE 1 END as rank
        FROM articles
        WHERE
          status = 'published'
          AND (publish_date IS NULL OR publish_date <= ${dateFilterParam})
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
          (
            ts_rank(to_tsvector('english', p.title), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(p.content, '')), to_tsquery('english', ${sanitizedQuery})) * 0.2
          ) * CASE WHEN p.title ILIKE '%' || ${query} || '%' THEN 2 ELSE 1 END as rank
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
          (
            ts_rank(to_tsvector('english', title), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(excerpt, '')), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(content, '')), to_tsquery('english', ${sanitizedQuery})) * 0.2
          ) * CASE WHEN title ILIKE '%' || ${query} || '%' THEN 2 ELSE 1 END as rank
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
      : await prisma.$queryRaw<SearchResult[]>`
      (
        SELECT
          id,
          title,
          type,
          LEFT(content, 200) as snippet,
          '/kemponet/kempopedia/wiki/' || id as url,
          'kempopedia' as domain,
          (
            ts_rank(to_tsvector('english', title), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(content, '')), to_tsquery('english', ${sanitizedQuery})) * 0.2
          ) * CASE WHEN title ILIKE '%' || ${query} || '%' THEN 2 ELSE 1 END as rank
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
          (
            ts_rank(to_tsvector('english', p.title), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(p.content, '')), to_tsquery('english', ${sanitizedQuery})) * 0.2
          ) * CASE WHEN p.title ILIKE '%' || ${query} || '%' THEN 2 ELSE 1 END as rank
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
          (
            ts_rank(to_tsvector('english', title), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(excerpt, '')), to_tsquery('english', ${sanitizedQuery})) * 1.0 +
            ts_rank(to_tsvector('english', COALESCE(content, '')), to_tsquery('english', ${sanitizedQuery})) * 0.2
          ) * CASE WHEN title ILIKE '%' || ${query} || '%' THEN 2 ELSE 1 END as rank
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

    // Clean up snippets and convert Kempopedia URLs to use slugs
    const cleanedResults = results.map(result => ({
      ...result,
      snippet: cleanSnippet(result.snippet, query),
      // Convert Kempopedia article URLs to use slugified titles
      url: result.domain === 'kempopedia'
        ? `/kemponet/kempopedia/wiki/${slugify(result.title)}`
        : result.url,
    }))

    return NextResponse.json(cleanedResults)
  } catch (error) {
    console.error("Search error:", error)

    // Fallback to simple ILIKE search if full-text search fails
    try {
      const articleResults = await prisma.article.findMany({
        where: {
          AND: [
            { status: "published" },
            {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            },
            // Date filter: show if publishDate is null OR <= viewing date
            ...(dateFilterParam
              ? [{
                  OR: [
                    { publishDate: null },
                    { publishDate: { lte: dateFilterParam } },
                  ],
                }]
              : []),
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
        url: `/kemponet/kempopedia/wiki/${slugify(result.title)}`,
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

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Reference {
  type: "article" | "page" | "flipflop" | "soundwaves"
  slug: string
  title: string
  field: string
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { url, slug, mediaType } = await request.json()

    if (!url && !slug) {
      return NextResponse.json({ error: "url or slug required" }, { status: 400 })
    }

    const references: Reference[] = []

    // Check if there's a Kempopedia article with the same slug
    if (slug) {
      const matchingArticle = await prisma.article.findUnique({
        where: { slug },
        select: { slug: true, title: true }
      })
      if (matchingArticle) {
        references.push({
          type: "article",
          slug: matchingArticle.slug,
          title: matchingArticle.title,
          field: "matching-slug"
        })
      }
    }

    // Search in articles for URL or slug references in content
    const articles = await prisma.article.findMany({
      select: { slug: true, title: true, content: true, infobox: true }
    })

    for (const article of articles) {
      // Skip if this is the matching article (already added above)
      if (slug && article.slug === slug) continue

      let foundIn: string[] = []

      // Check content field for URL or slug references
      if (article.content) {
        const hasUrlRef = url && article.content.includes(url)
        const hasSlugRef = slug && (
          article.content.toLowerCase().includes(`[[${slug.toLowerCase()}]]`) ||
          article.content.toLowerCase().includes(`[[${slug.toLowerCase()}|`)
        )

        if (hasUrlRef) foundIn.push("content (URL)")
        if (hasSlugRef) foundIn.push("content (wikilink)")
      }

      // Check infobox for URL references (especially in media array)
      if (article.infobox && url) {
        const infoboxStr = JSON.stringify(article.infobox)
        if (infoboxStr.includes(url)) {
          foundIn.push("infobox")
        }
      }

      if (foundIn.length > 0) {
        references.push({
          type: "article",
          slug: article.slug,
          title: article.title,
          field: foundIn.join(", ")
        })
      }
    }

    // Search in pages
    const pages = await prisma.page.findMany({
      select: { slug: true, title: true, content: true }
    })

    for (const page of pages) {
      if (page.content) {
        const hasUrlRef = url && page.content.includes(url)
        const hasSlugRef = slug && page.content.toLowerCase().includes(slug.toLowerCase())

        if (hasUrlRef || hasSlugRef) {
          references.push({
            type: "page",
            slug: page.slug,
            title: page.title,
            field: hasUrlRef ? "content (URL)" : "content (slug)"
          })
        }
      }
    }

    return NextResponse.json({ references })
  } catch (error) {
    console.error("Find references error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    )
  }
}

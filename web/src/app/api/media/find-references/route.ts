import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Reference {
  type: "article" | "page" | "flipflop" | "soundwaves"
  id: string
  title: string
  field: string
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 })
    }

    const references: Reference[] = []

    // Search in articles for URL references in content or infobox
    const articles = await prisma.article.findMany({
      select: { id: true, title: true, content: true, infobox: true }
    })

    for (const article of articles) {
      const foundIn: string[] = []

      // Check content field for URL references
      if (article.content && url && article.content.includes(url)) {
        foundIn.push("content (URL)")
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
          id: article.id,
          title: article.title,
          field: foundIn.join(", ")
        })
      }
    }

    // Search in pages
    const pages = await prisma.page.findMany({
      select: { id: true, slug: true, title: true, content: true }
    })

    for (const page of pages) {
      if (page.content && url && page.content.includes(url)) {
        references.push({
          type: "page",
          id: page.slug, // Use slug as identifier for pages (URL path)
          title: page.title,
          field: "content (URL)"
        })
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

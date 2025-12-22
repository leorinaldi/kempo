import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { url, slug } = await request.json()

    if (!url && !slug) {
      return NextResponse.json({ error: "url or slug required" }, { status: 400 })
    }

    let articlesUpdated = 0
    let pagesUpdated = 0

    // Update articles
    const articles = await prisma.article.findMany({
      select: { id: true, slug: true, content: true, infobox: true }
    })

    for (const article of articles) {
      let needsUpdate = false
      let newContent = article.content
      let newInfobox = article.infobox as Record<string, unknown> | null

      // Remove URL from content
      if (newContent && url && newContent.includes(url)) {
        // Remove image markdown references like ![alt](url)
        newContent = newContent.replace(new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegex(url)}\\)`, 'g'), '')
        // Remove plain URL references
        newContent = newContent.replace(new RegExp(escapeRegex(url), 'g'), '')
        // Clean up empty lines left behind
        newContent = newContent.replace(/\n{3,}/g, '\n\n')
        needsUpdate = true
      }

      // Remove slug-based wikilinks from content
      if (newContent && slug) {
        const slugLower = slug.toLowerCase()
        // Remove [[slug]] style links
        newContent = newContent.replace(new RegExp(`\\[\\[${escapeRegex(slugLower)}\\]\\]`, 'gi'), '')
        // Remove [[slug|text]] style links, keeping the text
        newContent = newContent.replace(new RegExp(`\\[\\[${escapeRegex(slugLower)}\\|([^\\]]+)\\]\\]`, 'gi'), '$1')
        if (newContent !== article.content) {
          needsUpdate = true
        }
      }

      // Remove URL from infobox media array
      if (newInfobox && url) {
        const infoboxStr = JSON.stringify(newInfobox)
        if (infoboxStr.includes(url)) {
          // Handle media array in infobox
          if (Array.isArray(newInfobox.media)) {
            newInfobox.media = (newInfobox.media as Array<{ url?: string }>).filter(
              (m) => m.url !== url
            )
            needsUpdate = true
          }

          // Handle nested infobox.infobox.image or similar structures
          if (newInfobox.infobox && typeof newInfobox.infobox === 'object') {
            const innerInfobox = newInfobox.infobox as Record<string, unknown>
            if (innerInfobox.image === url) {
              delete innerInfobox.image
              needsUpdate = true
            }
          }
        }
      }

      if (needsUpdate) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            content: newContent,
            infobox: newInfobox as Prisma.InputJsonValue
          }
        })
        articlesUpdated++
      }
    }

    // Update pages
    const pages = await prisma.page.findMany({
      select: { id: true, slug: true, content: true }
    })

    for (const page of pages) {
      let needsUpdate = false
      let newContent = page.content

      if (newContent) {
        // Remove URL references
        if (url && newContent.includes(url)) {
          // Remove img tags with this URL
          newContent = newContent.replace(new RegExp(`<img[^>]*src=["']${escapeRegex(url)}["'][^>]*>`, 'gi'), '')
          // Remove plain URL references
          newContent = newContent.replace(new RegExp(escapeRegex(url), 'g'), '')
          needsUpdate = true
        }

        // Remove slug references
        if (slug && newContent.toLowerCase().includes(slug.toLowerCase())) {
          // This is more conservative - just remove exact slug matches in likely places
          newContent = newContent.replace(new RegExp(`/${escapeRegex(slug)}(?=[/"'\\s])`, 'gi'), '')
          if (newContent !== page.content) {
            needsUpdate = true
          }
        }
      }

      if (needsUpdate) {
        await prisma.page.update({
          where: { id: page.id },
          data: { content: newContent }
        })
        pagesUpdated++
      }
    }

    return NextResponse.json({
      success: true,
      articlesUpdated,
      pagesUpdated
    })
  } catch (error) {
    console.error("Remove references error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Removal failed" },
      { status: 500 }
    )
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

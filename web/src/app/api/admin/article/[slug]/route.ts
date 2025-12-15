import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAdminArticleBySlugAsync } from "@/lib/admin-articles"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Check authentication
  const session = await auth()

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const article = await getAdminArticleBySlugAsync(slug)

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 })
  }

  return NextResponse.json({
    frontmatter: article.frontmatter,
    htmlContent: article.htmlContent,
    infobox: article.infobox,
  })
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get product-type articles that are not already linked to a product
    const articles = await prisma.article.findMany({
      where: {
        type: "product",
        product: null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subtype: true,
      },
      orderBy: { title: "asc" },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Failed to get available articles:", error)
    return NextResponse.json({ error: "Failed to get available articles" }, { status: 500 })
  }
}

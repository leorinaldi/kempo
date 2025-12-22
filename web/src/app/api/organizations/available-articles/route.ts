import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get all organization-type articles that are NOT linked to an Organization record
    const articles = await prisma.article.findMany({
      where: {
        type: "organization",
        organization: null, // Not linked to any organization
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
      orderBy: { title: "asc" },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Failed to list available articles:", error)
    return NextResponse.json({ error: "Failed to list available articles" }, { status: 500 })
  }
}

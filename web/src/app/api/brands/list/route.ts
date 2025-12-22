import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const brands = await prisma.brand.findMany({
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Failed to list brands:", error)
    return NextResponse.json({ error: "Failed to list brands" }, { status: 500 })
  }
}

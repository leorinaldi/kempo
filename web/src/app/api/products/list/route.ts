import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to list products:", error)
    return NextResponse.json({ error: "Failed to list products" }, { status: 500 })
  }
}

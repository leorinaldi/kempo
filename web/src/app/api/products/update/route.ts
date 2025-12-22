import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, name, productType, brandId, dateIntroduced, dateDiscontinued, articleId } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!productType) {
      return NextResponse.json({ error: "Product type is required" }, { status: 400 })
    }

    // Check if article is already linked to another product
    if (articleId) {
      const existingLink = await prisma.product.findFirst({
        where: {
          articleId,
          id: { not: id },
        },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another product" }, { status: 400 })
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        productType,
        brandId: brandId || null,
        dateIntroduced: dateIntroduced ? new Date(dateIntroduced) : null,
        dateDiscontinued: dateDiscontinued ? new Date(dateDiscontinued) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to update product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

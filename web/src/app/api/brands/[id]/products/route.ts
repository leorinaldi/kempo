import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const products = await prisma.product.findMany({
      where: { brandId: params.id },
      select: {
        id: true,
        name: true,
        productType: true,
        article: {
          select: {
            id: true,
            
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to get brand products:", error)
    return NextResponse.json({ error: "Failed to get brand products" }, { status: 500 })
  }
}

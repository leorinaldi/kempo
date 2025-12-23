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
    const brands = await prisma.brand.findMany({
      where: { organizationId: params.id },
      select: {
        id: true,
        name: true,
        article: {
          select: {
            id: true,
            slug: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            productType: true,
            article: {
              select: {
                id: true,
                slug: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Failed to get organization brands:", error)
    return NextResponse.json({ error: "Failed to get organization brands" }, { status: 500 })
  }
}

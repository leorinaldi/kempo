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
    const subjects = await prisma.imageSubject.findMany({
      where: {
        itemId: params.id,
        itemType: "product",
      },
      include: {
        image: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
      },
    })

    const images = subjects.map((s) => s.image)

    return NextResponse.json(images)
  } catch (error) {
    console.error("Failed to get product images:", error)
    return NextResponse.json({ error: "Failed to get product images" }, { status: 500 })
  }
}

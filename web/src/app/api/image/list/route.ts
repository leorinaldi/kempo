import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        altText: true,
        width: true,
        height: true,
        shape: true,
        category: true,
        articleSlug: true,
        kyDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Failed to fetch images:", error)
    return NextResponse.json([])
  }
}

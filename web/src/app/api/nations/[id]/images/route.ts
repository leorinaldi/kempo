import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params

    const imageSubjects = await prisma.imageSubject.findMany({
      where: {
        itemId: id,
        itemType: "nation",
      },
      include: {
        image: true,
      },
    })

    const images = imageSubjects.map((is) => is.image)

    return NextResponse.json(images)
  } catch (error) {
    console.error("Failed to get nation images:", error)
    return NextResponse.json({ error: "Failed to get nation images" }, { status: 500 })
  }
}

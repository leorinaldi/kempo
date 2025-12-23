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

    // Get all images linked to this person via image_subjects
    const imageSubjects = await prisma.imageSubject.findMany({
      where: {
        itemId: id,
        itemType: "person",
      },
      include: {
        image: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
    })

    const images = imageSubjects.map((subject) => subject.image)

    return NextResponse.json(images)
  } catch (error) {
    console.error("Failed to get person images:", error)
    return NextResponse.json({ error: "Failed to get images" }, { status: 500 })
  }
}

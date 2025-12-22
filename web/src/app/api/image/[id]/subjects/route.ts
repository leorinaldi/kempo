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

    // Get all subjects linked to this image
    const imageSubjects = await prisma.imageSubject.findMany({
      where: {
        imageId: id,
      },
    })

    // For each subject, fetch the related entity based on itemType
    const subjectsWithData = await Promise.all(
      imageSubjects.map(async (subject) => {
        if (subject.itemType === "person") {
          const person = await prisma.person.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              article: {
                select: {
                  slug: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            person: person
              ? {
                  id: person.id,
                  firstName: person.firstName,
                  middleName: person.middleName,
                  lastName: person.lastName,
                  articleSlug: person.article?.slug || null,
                }
              : undefined,
          }
        }
        // Add other item types here as needed (place, etc.)
        return {
          id: subject.id,
          itemId: subject.itemId,
          itemType: subject.itemType,
        }
      })
    )

    return NextResponse.json(subjectsWithData)
  } catch (error) {
    console.error("Failed to get image subjects:", error)
    return NextResponse.json({ error: "Failed to get subjects" }, { status: 500 })
  }
}

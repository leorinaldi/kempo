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
                  id: true,
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
                  articleId: person.article?.id || null,
                }
              : undefined,
          }
        }
        if (subject.itemType === "organization") {
          const organization = await prisma.organization.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              name: true,
              abbreviation: true,
              article: {
                select: {
                  id: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            organization: organization
              ? {
                  id: organization.id,
                  name: organization.name,
                  abbreviation: organization.abbreviation,
                  articleId: organization.article?.id || null,
                }
              : undefined,
          }
        }
        if (subject.itemType === "brand") {
          const brand = await prisma.brand.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              name: true,
              article: {
                select: {
                  id: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            brand: brand
              ? {
                  id: brand.id,
                  name: brand.name,
                  articleId: brand.article?.id || null,
                }
              : undefined,
          }
        }
        if (subject.itemType === "product") {
          const product = await prisma.product.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              name: true,
              article: {
                select: {
                  id: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  articleId: product.article?.id || null,
                }
              : undefined,
          }
        }
        if (subject.itemType === "nation") {
          const nation = await prisma.nation.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              name: true,
              shortCode: true,
              article: {
                select: {
                  id: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            nation: nation
              ? {
                  id: nation.id,
                  name: nation.name,
                  shortCode: nation.shortCode,
                  articleId: nation.article?.id || null,
                }
              : undefined,
          }
        }
        if (subject.itemType === "state") {
          const state = await prisma.state.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              name: true,
              abbreviation: true,
              article: {
                select: {
                  id: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            state: state
              ? {
                  id: state.id,
                  name: state.name,
                  abbreviation: state.abbreviation,
                  articleId: state.article?.id || null,
                }
              : undefined,
          }
        }
        if (subject.itemType === "city") {
          const city = await prisma.city.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              name: true,
              article: {
                select: {
                  id: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            city: city
              ? {
                  id: city.id,
                  name: city.name,
                  articleId: city.article?.id || null,
                }
              : undefined,
          }
        }
        if (subject.itemType === "place") {
          const place = await prisma.place.findUnique({
            where: { id: subject.itemId },
            select: {
              id: true,
              name: true,
              placeType: true,
              article: {
                select: {
                  id: true,
                },
              },
            },
          })
          return {
            id: subject.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
            place: place
              ? {
                  id: place.id,
                  name: place.name,
                  placeType: place.placeType,
                  articleId: place.article?.id || null,
                }
              : undefined,
          }
        }
        // Unknown item type
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

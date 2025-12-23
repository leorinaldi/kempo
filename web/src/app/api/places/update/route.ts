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
    const { id, name, placeType, cityId, parentPlaceId, address, dateOpened, dateClosed, articleId } = body

    if (!id) {
      return NextResponse.json({ error: "Place ID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!placeType) {
      return NextResponse.json({ error: "Place type is required" }, { status: 400 })
    }

    if (!cityId) {
      return NextResponse.json({ error: "City is required" }, { status: 400 })
    }

    // Prevent circular parent reference
    if (parentPlaceId === id) {
      return NextResponse.json({ error: "A place cannot be its own parent" }, { status: 400 })
    }

    if (articleId) {
      const existingLink = await prisma.place.findFirst({
        where: {
          articleId,
          NOT: { id },
        },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another place" }, { status: 400 })
      }
    }

    const place = await prisma.place.update({
      where: { id },
      data: {
        name,
        placeType,
        cityId,
        parentPlaceId: parentPlaceId || null,
        address: address || null,
        dateOpened: dateOpened ? new Date(dateOpened) : null,
        dateClosed: dateClosed ? new Date(dateClosed) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(place)
  } catch (error) {
    console.error("Failed to update place:", error)
    return NextResponse.json({ error: "Failed to update place" }, { status: 500 })
  }
}

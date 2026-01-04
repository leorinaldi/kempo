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

    const eventLocations = await prisma.eventLocation.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "asc" },
    })

    // Resolve location names based on type
    const resolvedLocations = await Promise.all(
      eventLocations.map(async (el) => {
        let locationName = "Unknown"
        let articleId: string | null = null

        switch (el.locationType) {
          case "nation": {
            const nation = await prisma.nation.findUnique({
              where: { id: el.locationId },
              select: { name: true, articleId: true },
            })
            if (nation) {
              locationName = nation.name
              articleId = nation.articleId
            }
            break
          }
          case "state": {
            const state = await prisma.state.findUnique({
              where: { id: el.locationId },
              select: { name: true, articleId: true, nation: { select: { name: true } } },
            })
            if (state) {
              locationName = `${state.name}, ${state.nation.name}`
              articleId = state.articleId
            }
            break
          }
          case "city": {
            const city = await prisma.city.findUnique({
              where: { id: el.locationId },
              select: {
                name: true,
                articleId: true,
                state: { select: { name: true, abbreviation: true } },
              },
            })
            if (city) {
              locationName = `${city.name}, ${city.state.abbreviation || city.state.name}`
              articleId = city.articleId
            }
            break
          }
          case "place": {
            const place = await prisma.place.findUnique({
              where: { id: el.locationId },
              select: {
                name: true,
                articleId: true,
                city: {
                  select: {
                    name: true,
                    state: { select: { abbreviation: true } },
                  },
                },
              },
            })
            if (place) {
              locationName = `${place.name}, ${place.city.name}, ${place.city.state.abbreviation}`
              articleId = place.articleId
            }
            break
          }
        }

        return {
          ...el,
          locationName,
          articleId,
        }
      })
    )

    return NextResponse.json(resolvedLocations)
  } catch (error) {
    console.error("Failed to list event locations:", error)
    return NextResponse.json({ error: "Failed to list event locations" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { locationType, locationId, role } = body

    if (!locationType) {
      return NextResponse.json({ error: "Location type is required" }, { status: 400 })
    }

    if (!locationId) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 })
    }

    if (!["nation", "state", "city", "place"].includes(locationType)) {
      return NextResponse.json({ error: "Invalid location type" }, { status: 400 })
    }

    // Check if link already exists
    const existing = await prisma.eventLocation.findUnique({
      where: {
        eventId_locationId_locationType: {
          eventId: id,
          locationId,
          locationType,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Location is already linked to this event" }, { status: 400 })
    }

    const eventLocation = await prisma.eventLocation.create({
      data: {
        eventId: id,
        locationType,
        locationId,
        role: role || null,
      },
    })

    return NextResponse.json(eventLocation)
  } catch (error) {
    console.error("Failed to add location to event:", error)
    return NextResponse.json({ error: "Failed to add location to event" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { locationType, locationId } = body

    if (!locationType || !locationId) {
      return NextResponse.json({ error: "Location type and ID are required" }, { status: 400 })
    }

    await prisma.eventLocation.delete({
      where: {
        eventId_locationId_locationType: {
          eventId: id,
          locationId,
          locationType,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove location from event:", error)
    return NextResponse.json({ error: "Failed to remove location from event" }, { status: 500 })
  }
}

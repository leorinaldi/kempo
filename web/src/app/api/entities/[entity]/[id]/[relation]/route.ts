import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getEntityConfig, isValidEntity, isValidRelation, EntityKey } from "../../../config"

type RouteParams = { params: Promise<{ entity: string; id: string; relation: string }> }

// GET: Get related items for an entity
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { entity, id, relation } = await params

    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
    }

    if (!isValidRelation(entity as EntityKey, relation)) {
      return NextResponse.json(
        { error: `Unknown relation '${relation}' for entity '${entity}'` },
        { status: 400 }
      )
    }

    const config = getEntityConfig(entity)
    const relationConfig = config.relations[relation]

    // Handle different relation types
    switch (relationConfig.type) {
      case "images":
        return await handleImages(id, relationConfig.itemType!)

      case "inspirations":
        return await handleInspirations(id, relationConfig.itemType!)

      case "children":
        return await handleChildren(id, relationConfig.childModel!, relationConfig.foreignKey!)

      case "custom":
        return await handleCustomRelation(entity as EntityKey, id, relation)

      default:
        return NextResponse.json({ error: "Unknown relation type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Failed to get relation:", error)
    return NextResponse.json({ error: "Failed to get relation" }, { status: 500 })
  }
}

// Handle images via ImageSubject polymorphic join table
async function handleImages(itemId: string, itemType: string) {
  const imageSubjects = await prisma.imageSubject.findMany({
    where: {
      itemId,
      itemType,
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
}

// Handle inspirations via Inspiration polymorphic table
async function handleInspirations(subjectId: string, subjectType: string) {
  const inspirations = await prisma.inspiration.findMany({
    where: {
      subjectId,
      subjectType,
    },
    select: {
      id: true,
      inspiration: true,
      wikipediaUrl: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  return NextResponse.json(inspirations)
}

// Handle parent-child relations (e.g., nation->states, brand->products)
async function handleChildren(parentId: string, childModel: string, foreignKey: string) {
  // @ts-expect-error - dynamic model access
  const children = await prisma[childModel].findMany({
    where: { [foreignKey]: parentId },
    include: {
      article: {
        select: {
          id: true,
          title: true,
        },
      },
      // Include count of grandchildren where applicable
      ...(childModel === "state" ? { _count: { select: { cities: true } } } : {}),
      ...(childModel === "city" ? { _count: { select: { places: true } } } : {}),
      // For brands, include actual products (not just count) so frontend can display product details
      ...(childModel === "brand"
        ? {
            products: {
              select: {
                id: true,
                name: true,
                productType: true,
                article: { select: { id: true } },
              },
              orderBy: { name: "asc" as const },
            },
          }
        : {}),
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(children)
}

// Handle custom relations that don't fit the standard patterns
async function handleCustomRelation(entity: EntityKey, id: string, relation: string) {
  switch (`${entity}:${relation}`) {
    case "events:people":
      return await handleEventPeople(id)

    case "events:locations":
      return await handleEventLocations(id)

    case "events:media":
      return await handleEventMedia(id)

    case "events:relations":
      return await handleEventRelations(id)

    case "albums:tracks":
      return await handleAlbumTracks(id)

    default:
      return NextResponse.json({ error: "Unknown custom relation" }, { status: 400 })
  }
}

// Event people
async function handleEventPeople(eventId: string) {
  const eventPeople = await prisma.eventPerson.findMany({
    where: { eventId },
    include: {
      person: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          stageName: true,
        },
      },
    },
  })

  return NextResponse.json(
    eventPeople.map((ep) => ({
      id: ep.id,
      personId: ep.personId,
      person: ep.person,
      role: ep.role,
    }))
  )
}

// Event locations
async function handleEventLocations(eventId: string) {
  const eventLocations = await prisma.eventLocation.findMany({
    where: { eventId },
  })

  // Resolve location names based on type
  const locationsWithNames = await Promise.all(
    eventLocations.map(async (el) => {
      let locationName = ""

      switch (el.locationType) {
        case "nation":
          const nation = await prisma.nation.findUnique({
            where: { id: el.locationId },
            select: { name: true },
          })
          locationName = nation?.name || "Unknown"
          break
        case "state":
          const state = await prisma.state.findUnique({
            where: { id: el.locationId },
            select: { name: true },
          })
          locationName = state?.name || "Unknown"
          break
        case "city":
          const city = await prisma.city.findUnique({
            where: { id: el.locationId },
            select: { name: true },
          })
          locationName = city?.name || "Unknown"
          break
        case "place":
          const place = await prisma.place.findUnique({
            where: { id: el.locationId },
            select: { name: true },
          })
          locationName = place?.name || "Unknown"
          break
      }

      return {
        id: el.id,
        locationType: el.locationType,
        locationId: el.locationId,
        locationName,
        role: el.role,
      }
    })
  )

  return NextResponse.json(locationsWithNames)
}

// Event media
async function handleEventMedia(eventId: string) {
  const eventMedia = await prisma.eventMedia.findMany({
    where: { eventId },
  })

  return NextResponse.json(eventMedia)
}

// Event relations
async function handleEventRelations(eventId: string) {
  const relations = await prisma.eventRelation.findMany({
    where: { eventId },
    include: {
      relatedEvent: {
        select: {
          id: true,
          title: true,
          kyDateBegin: true,
        },
      },
    },
  })

  return NextResponse.json(
    relations.map((r) => ({
      id: r.id,
      relatedEventId: r.relatedEventId,
      relatedEvent: r.relatedEvent,
      relationType: r.relationType,
    }))
  )
}

// Album tracks via AudioElement
async function handleAlbumTracks(albumId: string) {
  const audioElements = await prisma.audioElement.findMany({
    where: {
      itemId: albumId,
      itemType: "album",
    },
    include: {
      audio: {
        select: {
          id: true,
          name: true,
          url: true,
          duration: true,
        },
      },
    },
  })

  return NextResponse.json(audioElements.map((ae) => ae.audio))
}

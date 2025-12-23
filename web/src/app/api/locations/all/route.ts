import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get all locations with coordinates
    const [nations, states, cities, places] = await Promise.all([
      prisma.nation.findMany({
        where: { lat: { not: null }, long: { not: null } },
        select: {
          id: true,
          name: true,
          shortCode: true,
          lat: true,
          long: true,
          article: { select: { id: true } },
        },
      }),
      prisma.state.findMany({
        where: { lat: { not: null }, long: { not: null } },
        select: {
          id: true,
          name: true,
          abbreviation: true,
          lat: true,
          long: true,
          nation: { select: { name: true } },
          article: { select: { id: true } },
        },
      }),
      prisma.city.findMany({
        where: { lat: { not: null }, long: { not: null } },
        select: {
          id: true,
          name: true,
          cityType: true,
          lat: true,
          long: true,
          state: { select: { name: true, nation: { select: { name: true } } } },
          article: { select: { id: true } },
        },
      }),
      prisma.place.findMany({
        where: { lat: { not: null }, long: { not: null } },
        select: {
          id: true,
          name: true,
          placeType: true,
          lat: true,
          long: true,
          city: { select: { name: true, state: { select: { name: true } } } },
          article: { select: { id: true } },
        },
      }),
    ])

    return NextResponse.json({ nations, states, cities, places })
  } catch (error) {
    console.error("Failed to get locations:", error)
    return NextResponse.json({ error: "Failed to get locations" }, { status: 500 })
  }
}

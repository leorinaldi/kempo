import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("eventType")

    const events = await prisma.event.findMany({
      where: eventType ? { eventType } : undefined,
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            children: true,
            people: true,
            locations: true,
            relationsFrom: true,
            relationsTo: true,
          },
        },
      },
      orderBy: { kyDateBegin: "desc" },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to list events:", error)
    return NextResponse.json({ error: "Failed to list events" }, { status: 500 })
  }
}

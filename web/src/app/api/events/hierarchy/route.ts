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
    const excludeId = searchParams.get("excludeId")

    // Get all events suitable as parents
    // Exclude the current event if editing (to prevent circular reference)
    const events = await prisma.event.findMany({
      where: excludeId ? { NOT: { id: excludeId } } : undefined,
      select: {
        id: true,
        title: true,
        eventType: true,
        kyDateBegin: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ kyDateBegin: "desc" }, { title: "asc" }],
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to list event hierarchy:", error)
    return NextResponse.json({ error: "Failed to list event hierarchy" }, { status: 500 })
  }
}

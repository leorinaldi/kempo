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

    // Get all inspirations for this organization
    const inspirations = await prisma.inspiration.findMany({
      where: {
        subjectId: id,
        subjectType: "organization",
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
  } catch (error) {
    console.error("Failed to get organization inspirations:", error)
    return NextResponse.json({ error: "Failed to get inspirations" }, { status: 500 })
  }
}

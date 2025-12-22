import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const inspirations = await prisma.inspiration.findMany({
      where: {
        subjectId: params.id,
        subjectType: "brand",
      },
      select: {
        id: true,
        inspiration: true,
        wikipediaUrl: true,
      },
      orderBy: { inspiration: "asc" },
    })

    return NextResponse.json(inspirations)
  } catch (error) {
    console.error("Failed to get brand inspirations:", error)
    return NextResponse.json({ error: "Failed to get brand inspirations" }, { status: 500 })
  }
}

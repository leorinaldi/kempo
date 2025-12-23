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

    const inspirations = await prisma.inspiration.findMany({
      where: {
        subjectId: id,
        subjectType: "city",
      },
      orderBy: { inspiration: "asc" },
    })

    return NextResponse.json(inspirations)
  } catch (error) {
    console.error("Failed to get city inspirations:", error)
    return NextResponse.json({ error: "Failed to get city inspirations" }, { status: 500 })
  }
}

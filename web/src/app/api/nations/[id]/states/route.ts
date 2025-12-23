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

    const states = await prisma.state.findMany({
      where: { nationId: id },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        _count: {
          select: { cities: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(states)
  } catch (error) {
    console.error("Failed to list states:", error)
    return NextResponse.json({ error: "Failed to list states" }, { status: 500 })
  }
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const states = await prisma.state.findMany({
      include: {
        nation: {
          select: {
            id: true,
            name: true,
          },
        },
        article: {
          select: {
            id: true,
            
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

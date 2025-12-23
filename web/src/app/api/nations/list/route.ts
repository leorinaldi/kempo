import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const nations = await prisma.nation.findMany({
      include: {
        article: {
          select: {
            id: true,
            
            title: true,
          },
        },
        _count: {
          select: { states: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(nations)
  } catch (error) {
    console.error("Failed to list nations:", error)
    return NextResponse.json({ error: "Failed to list nations" }, { status: 500 })
  }
}

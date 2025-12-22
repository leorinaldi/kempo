import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const people = await prisma.person.findMany({
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: { lastName: "asc" },
    })

    return NextResponse.json(people)
  } catch (error) {
    console.error("Failed to list people:", error)
    return NextResponse.json({ error: "Failed to list people" }, { status: 500 })
  }
}

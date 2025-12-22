import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const organizations = await prisma.organization.findMany({
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error("Failed to list organizations:", error)
    return NextResponse.json({ error: "Failed to list organizations" }, { status: 500 })
  }
}

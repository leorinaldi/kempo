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
    const orgType = searchParams.get("orgType")

    const organizations = await prisma.organization.findMany({
      where: orgType ? { orgType } : undefined,
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

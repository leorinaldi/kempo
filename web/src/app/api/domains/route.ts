import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        displayName: true,
        owner: true,
      },
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error("Failed to fetch domains:", error)
    return NextResponse.json([])
  }
}

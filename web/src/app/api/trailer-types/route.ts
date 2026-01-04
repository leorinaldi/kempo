import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const trailerTypes = await prisma.trailerType.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(trailerTypes)
  } catch (error) {
    console.error("Failed to fetch trailer types:", error)
    return NextResponse.json({ error: "Failed to fetch trailer types" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const adTypes = await prisma.adType.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(adTypes)
  } catch (error) {
    console.error("Failed to fetch ad types:", error)
    return NextResponse.json({ error: "Failed to fetch ad types" }, { status: 500 })
  }
}

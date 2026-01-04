import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const contentTypes = await prisma.contentType.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(contentTypes)
  } catch (error) {
    console.error("Failed to fetch content types:", error)
    return NextResponse.json({ error: "Failed to fetch content types" }, { status: 500 })
  }
}

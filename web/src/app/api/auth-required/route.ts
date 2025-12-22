import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public endpoint - returns whether auth is required
// Called by middleware to check if login is needed
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "authRequired" },
    })
    return NextResponse.json({ required: setting?.value !== "false" })
  } catch {
    // If DB fails, default to requiring auth
    return NextResponse.json({ required: true })
  }
}

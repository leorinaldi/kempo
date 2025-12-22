import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const settings = await prisma.setting.findMany()
    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({})
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { key, value } = await request.json()

    if (!key || typeof value !== "string") {
      return NextResponse.json({ error: "Key and value required" }, { status: 400 })
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error("Failed to update setting:", error)
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
  }
}

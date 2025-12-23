import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, name, description, type, kyDate } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const updated = await prisma.audio.update({
      where: { id },
      data: {
        name,
        description: description || null,
        type: type || "song",
        kyDate: kyDate ? new Date(kyDate) : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update audio:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update audio" },
      { status: 500 }
    )
  }
}

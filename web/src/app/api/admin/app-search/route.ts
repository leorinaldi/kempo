import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const entries = await prisma.appSearch.findMany({
      orderBy: { title: "asc" },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error("Failed to fetch app search entries:", error)
    return NextResponse.json([])
  }
}

export async function PUT(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id, path, domain, title, excerpt, content, noSearch } = await request.json()

    const entry = await prisma.appSearch.update({
      where: { id },
      data: { path, domain, title, excerpt, content, noSearch: noSearch ?? false },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Failed to update app search entry:", error)
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await request.json()

    await prisma.appSearch.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete app search entry:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }
}

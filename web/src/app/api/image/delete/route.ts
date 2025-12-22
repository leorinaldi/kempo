import { auth } from "@/auth"
import { del } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Find the image in database
    const image = await prisma.image.findFirst({ where: { url } })

    if (!image) {
      return NextResponse.json({ error: "Image not found in database" }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(url)
    } catch (blobError) {
      console.error("Failed to delete from blob storage:", blobError)
      // Continue anyway to clean up database
    }

    // Delete from database
    await prisma.image.delete({ where: { id: image.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    )
  }
}

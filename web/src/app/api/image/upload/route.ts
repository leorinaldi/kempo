import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Calculate shape from actual dimensions (overrides user selection)
function getShapeFromDimensions(width: number | null, height: number | null): string | null {
  if (!width || !height) return null
  const ratio = width / height
  if (ratio > 1.2) return "landscape"
  if (ratio < 0.8) return "portrait"
  return "square"
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null
    const slug = formData.get("slug") as string | null
    const description = formData.get("description") as string | null
    const altText = formData.get("altText") as string | null
    const shape = formData.get("shape") as string | null
    const category = formData.get("category") as string | null
    const articleSlug = formData.get("articleSlug") as string | null
    const widthStr = formData.get("width") as string | null
    const heightStr = formData.get("height") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title || !slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await prisma.image.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: `An image with slug "${slug}" already exists. Please choose a different slug.` },
        { status: 409 }
      )
    }

    // Determine file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"

    // Parse width/height if provided
    const width = widthStr ? parseInt(widthStr, 10) : null
    const height = heightStr ? parseInt(heightStr, 10) : null

    // Calculate shape from actual dimensions (overrides user selection)
    const calculatedShape = getShapeFromDimensions(width, height) || shape || null

    // Create database entry first to get the ID
    const image = await prisma.image.create({
      data: {
        slug,
        name: title,
        url: "", // Temporary, will be updated after blob upload
        description: description || null,
        altText: altText || null,
        width: width || null,
        height: height || null,
        shape: calculatedShape,
        category: category || null,
        articleSlug: articleSlug || null,
      },
    })

    // Upload to Vercel Blob using ID-based path
    const blob = await put(
      `kempo-media/image/${image.id}.${extension}`,
      file,
      { access: "public" }
    )

    // Update database with the blob URL
    await prisma.image.update({
      where: { id: image.id },
      data: { url: blob.url },
    })

    return NextResponse.json({
      success: true,
      id: image.id,
      url: blob.url,
      title,
      slug,
      filename: `${image.id}.${extension}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}

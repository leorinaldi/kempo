import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // Check authentication
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
    const mediaType = formData.get("mediaType") as string | null
    const description = formData.get("description") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title || !slug || !mediaType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin"

    // Upload to Vercel Blob
    const blob = await put(
      `kempo-media/${mediaType}/${slug}.${extension}`,
      file,
      { access: "public" }
    )

    return NextResponse.json({
      success: true,
      url: blob.url,
      title,
      slug,
      mediaType,
      description,
      filename: `${slug}.${extension}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}

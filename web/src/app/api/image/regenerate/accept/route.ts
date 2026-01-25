import { auth } from "@/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Accept a regenerated image preview and save it
 * Creates a new Image record, uploads to Vercel Blob, and optionally replaces the original
 */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
  }

  try {
    const { originalImageId, base64, mimeType, generationTool, prompt } = await request.json()

    if (!originalImageId || !base64) {
      return NextResponse.json({ error: "originalImageId and base64 are required" }, { status: 400 })
    }

    // Get the original image
    const originalImage = await prisma.image.findUnique({
      where: { id: originalImageId },
    })

    if (!originalImage) {
      return NextResponse.json({ error: "Original image not found" }, { status: 404 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64, "base64")

    // Determine file extension from mime type
    const extension = mimeType === "image/png" ? "png" : "jpg"

    // Create new database entry
    const newImage = await prisma.image.create({
      data: {
        name: originalImage.name,
        url: "", // Temporary, will be updated after blob upload
        description: originalImage.description,
        altText: originalImage.altText,
        category: originalImage.category,
        articleId: originalImage.articleId, // Keep same article link
        prompt: prompt || originalImage.prompt,
        generationTool: generationTool || originalImage.generationTool,
        style: originalImage.style,
        previousVersionId: originalImage.id, // Link to previous version
        kyDate: originalImage.kyDate,
        shape: originalImage.shape,
      },
    })

    // Upload to Vercel Blob
    const blob = await put(
      `kempo-media/image/${newImage.id}.${extension}`,
      buffer,
      { access: "public" }
    )

    // Update database with the blob URL
    await prisma.image.update({
      where: { id: newImage.id },
      data: { url: blob.url },
    })

    // Unlink the original image from the article (new one takes its place)
    if (originalImage.articleId) {
      await prisma.image.update({
        where: { id: originalImage.id },
        data: { articleId: null },
      })
    }

    // Update ALL articles that reference the old image URL in their infobox
    // This handles cases where the image was linked manually or through different workflows
    const allArticles = await prisma.article.findMany({
      where: {
        infobox: {
          path: ['image', 'url'],
          equals: originalImage.url,
        },
      },
    })

    for (const article of allArticles) {
      const infobox = article.infobox as Record<string, unknown>
      const imageField = infobox.image as { url?: string; caption?: string } | undefined

      if (imageField?.url === originalImage.url) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            infobox: {
              ...infobox,
              image: {
                ...imageField,
                url: blob.url,
              },
            },
          },
        })
      }
    }

    // Also copy over ImageSubject links from the old image to the new one
    const oldSubjects = await prisma.imageSubject.findMany({
      where: { imageId: originalImage.id },
    })

    for (const subject of oldSubjects) {
      await prisma.imageSubject.create({
        data: {
          imageId: newImage.id,
          itemId: subject.itemId,
          itemType: subject.itemType,
        },
      })
    }

    return NextResponse.json({
      success: true,
      newImage: {
        id: newImage.id,
        url: blob.url,
        name: newImage.name,
      },
      replacedImageId: originalImage.id,
    })
  } catch (error) {
    console.error("Accept regenerated image error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save image" },
      { status: 500 }
    )
  }
}

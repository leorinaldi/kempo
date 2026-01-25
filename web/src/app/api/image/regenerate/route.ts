import { auth } from "@/auth"
import { NextResponse } from "next/server"

const XAI_API_KEY = process.env.XAI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

/**
 * Generate a preview image using Grok or Gemini API
 * Returns base64 data without saving to database
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
    const { prompt, tool } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!tool || !["grok", "gemini"].includes(tool)) {
      return NextResponse.json({ error: "Tool must be 'grok' or 'gemini'" }, { status: 400 })
    }

    let imageData: { base64: string; mimeType: string; generationTool: string }

    if (tool === "gemini") {
      if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
      }
      imageData = await generateWithGemini(prompt)
    } else {
      if (!XAI_API_KEY) {
        return NextResponse.json({ error: "XAI_API_KEY not configured" }, { status: 500 })
      }
      imageData = await generateWithGrok(prompt)
    }

    return NextResponse.json({
      success: true,
      base64: imageData.base64,
      mimeType: imageData.mimeType,
      generationTool: imageData.generationTool,
    })
  } catch (error) {
    console.error("Regenerate error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    )
  }
}

async function generateWithGrok(prompt: string): Promise<{ base64: string; mimeType: string; generationTool: string }> {
  const response = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-2-image-1212",
      prompt: prompt,
      n: 1,
      response_format: "url",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Grok API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  if (!data.data?.[0]?.url) {
    throw new Error("Invalid Grok API response: no image URL returned")
  }

  // Download the image and convert to base64
  const imageResponse = await fetch(data.data[0].url)
  if (!imageResponse.ok) {
    throw new Error("Failed to download generated image from Grok")
  }

  const arrayBuffer = await imageResponse.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  return {
    base64,
    mimeType: "image/jpeg",
    generationTool: "grok-2-image-1212",
  }
}

async function generateWithGemini(prompt: string): Promise<{ base64: string; mimeType: string; generationTool: string }> {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
    {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  // Find the image part in the response
  const candidates = data.candidates || []
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || []
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
          generationTool: "gemini-2.0-flash-exp",
        }
      }
    }
  }

  throw new Error("Invalid Gemini API response: no image data returned")
}

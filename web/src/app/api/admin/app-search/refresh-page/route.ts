import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"

const anthropic = new Anthropic()

// AI-powered refresh for a single page
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { path: pagePath } = await request.json()

    if (!pagePath) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 })
    }

    // Build file path from URL path
    const parts = pagePath.split("/").filter(Boolean)
    const kemponetDir = path.join(process.cwd(), "src/app/kemponet")
    const relativePath = parts.slice(1).join("/") || ""
    const filePath = path.join(kemponetDir, relativePath, "page.tsx")

    // Read the file content
    let fileContent: string
    try {
      fileContent = fs.readFileSync(filePath, "utf-8")
    } catch {
      return NextResponse.json({ error: "Page file not found" }, { status: 404 })
    }

    // Use AI to analyze the page and generate search content
    const aiResult = await analyzePageWithAI(fileContent, pagePath)

    // Update the database entry
    const domainName = parts[1] || "kemponet"

    await prisma.appSearch.upsert({
      where: { path: pagePath },
      update: {
        domain: domainName,
        title: aiResult.title,
        excerpt: aiResult.excerpt,
        content: aiResult.content,
        refreshedAt: new Date(),
      },
      create: {
        path: pagePath,
        domain: domainName,
        title: aiResult.title,
        excerpt: aiResult.excerpt,
        content: aiResult.content,
        refreshedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      title: aiResult.title,
      excerpt: aiResult.excerpt,
    })
  } catch (error) {
    console.error("Failed to refresh page with AI:", error)
    return NextResponse.json({ error: "Failed to refresh page" }, { status: 500 })
  }
}

async function analyzePageWithAI(fileContent: string, pagePath: string): Promise<{
  title: string
  excerpt: string
  content: string
}> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this React page component and extract search-friendly content for a search engine index.

IMPORTANT CONTEXT: This is for a fictional retro-internet world called "KempoNet" set in an alternate universe. Do NOT reference any real-world brands, companies, or products (like TikTok, YouTube, Google, Wikipedia, etc.). Describe features generically or use the in-universe brand names visible in the code (like Giggle, Kempopedia, KempoTube, FlipFlop, etc.).

Page URL path: ${pagePath}

React component code:
\`\`\`tsx
${fileContent}
\`\`\`

Based on the page content, provide:
1. **title**: A clear, descriptive title for this page (what users would see in search results)
2. **excerpt**: A 1-2 sentence description of what this page offers (for search result snippets). Keep it in-universe.
3. **content**: Keywords and phrases that describe the page's content and functionality (for full-text search matching). Include the main features, any text content visible to users, and relevant terms. No real-world brand references.

Respond in JSON format only:
{
  "title": "...",
  "excerpt": "...",
  "content": "..."
}`,
      },
    ],
  })

  // Extract the text content from the response
  const textBlock = message.content.find(block => block.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI")
  }

  // Parse the JSON response
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON")
  }

  const result = JSON.parse(jsonMatch[0])

  return {
    title: result.title || "Untitled Page",
    excerpt: result.excerpt || "No description available.",
    content: result.content || "",
  }
}

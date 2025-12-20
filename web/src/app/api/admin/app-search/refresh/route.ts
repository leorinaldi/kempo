import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import * as fs from "fs"
import * as path from "path"

const anthropic = new Anthropic()

// Scan kemponet folder for page.tsx files and create entries for NEW pages only
export async function POST() {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const kemponetDir = path.join(process.cwd(), "src/app/kemponet")
    const pages = scanForPages(kemponetDir, "/kemponet")

    // Filter out dynamic routes and the catch-all route
    const staticPages = pages.filter(p => !p.includes("["))

    const results = {
      scanned: staticPages.length,
      created: 0,
      skipped: 0,
    }

    for (const pagePath of staticPages) {
      // Check if entry already exists
      const existing = await prisma.appSearch.findUnique({
        where: { path: pagePath },
      })

      if (existing) {
        // Entry exists - skip it (user can manually AI refresh if needed)
        results.skipped++
      } else {
        // New page - use AI to generate content
        const parts = pagePath.split("/").filter(Boolean)
        const domainName = parts[1] || "kemponet"
        const relativePath = parts.slice(1).join("/") || ""
        const filePath = path.join(kemponetDir, relativePath, "page.tsx")

        try {
          const fileContent = fs.readFileSync(filePath, "utf-8")
          const aiResult = await analyzePageWithAI(fileContent, pagePath)

          await prisma.appSearch.create({
            data: {
              path: pagePath,
              domain: domainName,
              title: aiResult.title,
              excerpt: aiResult.excerpt,
              content: aiResult.content,
              refreshedAt: new Date(),
            },
          })
          results.created++
        } catch (e) {
          console.error(`Failed to process ${pagePath}:`, e)
          // Create with basic fallback data
          await prisma.appSearch.create({
            data: {
              path: pagePath,
              domain: domainName,
              title: generateTitleFromPath(parts),
              excerpt: `${generateTitleFromPath(parts)} on the KempoNet.`,
              content: generateTitleFromPath(parts),
            },
          })
          results.created++
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to refresh app search entries:", error)
    return NextResponse.json({ error: "Failed to refresh entries" }, { status: 500 })
  }
}

// Recursively scan for page.tsx files
function scanForPages(dir: string, urlPath: string): string[] {
  const pages: string[] = []

  if (!fs.existsSync(dir)) {
    return pages
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subPath = path.join(dir, entry.name)
      const subUrl = `${urlPath}/${entry.name}`
      pages.push(...scanForPages(subPath, subUrl))
    } else if (entry.name === "page.tsx") {
      pages.push(urlPath)
    }
  }

  return pages
}

// Generate title from path parts
function generateTitleFromPath(parts: string[]): string {
  const subPath = parts.slice(2).join("/")
  return (subPath || parts[1] || "KempoNet")
    .split(/[-/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Use AI to analyze page content
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

  const textBlock = message.content.find(block => block.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI")
  }

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

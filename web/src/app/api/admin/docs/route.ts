import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { promises as fs } from "fs"
import path from "path"

const PROJECT_ROOT = path.resolve(process.cwd(), "..")

// Files that appear at the top level
const TOP_LEVEL_FILES = ["CLAUDE.md", "README.md"]

// Structure for the docs folder
interface DocItem {
  name: string
  path: string
  type: "file" | "folder"
  children?: DocItem[]
}

async function getDocsStructure(): Promise<DocItem[]> {
  const items: DocItem[] = []

  // Add top-level files
  for (const file of TOP_LEVEL_FILES) {
    const filePath = path.join(PROJECT_ROOT, file)
    try {
      await fs.access(filePath)
      items.push({
        name: file,
        path: file,
        type: "file",
      })
    } catch {
      // File doesn't exist, skip
    }
  }

  // Add docs folder
  const docsPath = path.join(PROJECT_ROOT, "docs")
  try {
    const docsItems = await scanDirectory(docsPath, "docs")
    if (docsItems.length > 0) {
      items.push({
        name: "docs",
        path: "docs",
        type: "folder",
        children: docsItems,
      })
    }
  } catch {
    // docs folder doesn't exist
  }

  return items
}

async function scanDirectory(dirPath: string, relativePath: string): Promise<DocItem[]> {
  const items: DocItem[] = []
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  // Sort: folders first, then files, alphabetically
  const sorted = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })

  for (const entry of sorted) {
    const entryPath = path.join(dirPath, entry.name)
    const entryRelativePath = path.join(relativePath, entry.name)

    if (entry.isDirectory()) {
      const children = await scanDirectory(entryPath, entryRelativePath)
      items.push({
        name: entry.name,
        path: entryRelativePath,
        type: "folder",
        children,
      })
    } else if (entry.name.endsWith(".md")) {
      items.push({
        name: entry.name,
        path: entryRelativePath,
        type: "file",
      })
    }
  }

  return items
}

async function readDocFile(filePath: string): Promise<string> {
  // Sanitize path to prevent directory traversal
  const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "")
  const fullPath = path.join(PROJECT_ROOT, normalizedPath)

  // Ensure the file is within the project root
  if (!fullPath.startsWith(PROJECT_ROOT)) {
    throw new Error("Invalid file path")
  }

  // Ensure it's a markdown file
  if (!fullPath.endsWith(".md")) {
    throw new Error("Only markdown files can be read")
  }

  const content = await fs.readFile(fullPath, "utf-8")
  return content
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get("path")

  try {
    if (filePath) {
      // Read specific file
      const content = await readDocFile(filePath)
      return NextResponse.json({ content, path: filePath })
    } else {
      // List all docs
      const structure = await getDocsStructure()
      return NextResponse.json({ structure })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

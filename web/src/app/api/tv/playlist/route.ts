import { auth } from "@/auth"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const playlistPath = path.join(process.cwd(), "public", "tv-playlist.json")

export async function GET() {
  try {
    const data = fs.readFileSync(playlistPath, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const playlist = await request.json()

    // Validate playlist structure
    if (!Array.isArray(playlist)) {
      return NextResponse.json({ error: "Invalid playlist format" }, { status: 400 })
    }

    for (const item of playlist) {
      if (!item.id || !item.name || !item.url) {
        return NextResponse.json({ error: "Invalid playlist item" }, { status: 400 })
      }
    }

    fs.writeFileSync(playlistPath, JSON.stringify(playlist, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save playlist" },
      { status: 500 }
    )
  }
}

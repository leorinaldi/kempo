import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const accounts = await prisma.flipFlopAccount.findMany({
      orderBy: { name: "asc" },
      include: {
        person: { select: { id: true, firstName: true, lastName: true, stageName: true } },
        _count: { select: { videos: true } },
      },
    })
    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Failed to fetch FlipFlop accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, personId } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const account = await prisma.flipFlopAccount.create({
      data: {
        name,
        personId: personId || null,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error("Failed to create FlipFlop account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}

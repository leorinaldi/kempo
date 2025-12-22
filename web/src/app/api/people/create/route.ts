import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { firstName, middleName, lastName, gender, dateBorn, dateDied, articleId } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 })
    }

    if (!["male", "female"].includes(gender)) {
      return NextResponse.json({ error: "Gender must be 'male' or 'female'" }, { status: 400 })
    }

    // Check if article is already linked to another person
    if (articleId) {
      const existingLink = await prisma.person.findFirst({
        where: { articleId },
      })
      if (existingLink) {
        return NextResponse.json({ error: "This article is already linked to another person" }, { status: 400 })
      }
    }

    const person = await prisma.person.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        gender,
        dateBorn: dateBorn ? new Date(dateBorn) : null,
        dateDied: dateDied ? new Date(dateDied) : null,
        articleId: articleId || null,
      },
    })

    return NextResponse.json(person)
  } catch (error) {
    console.error("Failed to create person:", error)
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 })
  }
}

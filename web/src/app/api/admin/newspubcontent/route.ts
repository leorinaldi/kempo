import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - List all content for a publication
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const publicationId = searchParams.get('publicationId')

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId required' }, { status: 400 })
    }

    const contents = await prisma.newsPubContent.findMany({
      where: { publicationId },
      orderBy: { sortOrder: 'asc' },
      include: {
        heroImage: {
          select: { id: true, name: true, url: true },
        },
        elements: {
          include: {
            person: {
              select: { id: true, firstName: true, lastName: true, stageName: true },
            },
          },
        },
      },
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Failed to fetch content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST - Create new content
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      publicationId,
      title,
      subtitle,
      type,
      content,
      sortOrder,
      heroImageId,
      heroPosition,
      layoutStyle,
      pullquotes,
      useDropcap,
      columns,
      accentColor,
      bylines, // Array of { personId, role, credit }
    } = body

    if (!publicationId || !title || !type || !content || sortOrder === undefined) {
      return NextResponse.json(
        { error: 'publicationId, title, type, content, and sortOrder are required' },
        { status: 400 }
      )
    }

    const newContent = await prisma.newsPubContent.create({
      data: {
        publicationId,
        title,
        subtitle: subtitle || null,
        type,
        content,
        sortOrder,
        heroImageId: heroImageId || null,
        heroPosition: heroPosition || null,
        layoutStyle: layoutStyle || null,
        pullquotes: pullquotes || null,
        useDropcap: useDropcap ?? null,
        columns: columns ?? null,
        accentColor: accentColor || null,
        elements: bylines?.length
          ? {
              create: bylines.map((b: { personId: string; role: string; credit?: string }) => ({
                personId: b.personId,
                role: b.role,
                credit: b.credit || null,
              })),
            }
          : undefined,
      },
      include: {
        heroImage: {
          select: { id: true, name: true, url: true },
        },
        elements: {
          include: {
            person: {
              select: { id: true, firstName: true, lastName: true, stageName: true },
            },
          },
        },
      },
    })

    return NextResponse.json(newContent)
  } catch (error) {
    console.error('Failed to create content:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}

// PUT - Update content
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      title,
      subtitle,
      type,
      content,
      sortOrder,
      heroImageId,
      heroPosition,
      layoutStyle,
      pullquotes,
      useDropcap,
      columns,
      accentColor,
      bylines, // Array of { personId, role, credit }
    } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Update content
    const updated = await prisma.newsPubContent.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        type,
        content,
        sortOrder,
        heroImageId: heroImageId || null,
        heroPosition: heroPosition || null,
        layoutStyle: layoutStyle || null,
        pullquotes: pullquotes || null,
        useDropcap: useDropcap ?? null,
        columns: columns ?? null,
        accentColor: accentColor || null,
      },
    })

    // Update bylines if provided
    if (bylines !== undefined) {
      // Delete existing bylines
      await prisma.newsPubContentElement.deleteMany({
        where: { contentId: id },
      })

      // Create new bylines
      if (bylines?.length) {
        await prisma.newsPubContentElement.createMany({
          data: bylines.map((b: { personId: string; role: string; credit?: string }) => ({
            contentId: id,
            personId: b.personId,
            role: b.role,
            credit: b.credit || null,
          })),
        })
      }
    }

    // Fetch updated content with relations
    const result = await prisma.newsPubContent.findUnique({
      where: { id },
      include: {
        heroImage: {
          select: { id: true, name: true, url: true },
        },
        elements: {
          include: {
            person: {
              select: { id: true, firstName: true, lastName: true, stageName: true },
            },
          },
        },
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to update content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

// DELETE - Delete content
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    await prisma.newsPubContent.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete content:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}

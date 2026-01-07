import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find series by slugified name
    const allSeries = await prisma.publicationSeries.findMany({
      where: {
        type: { in: ['magazine', 'newspaper'] },
      },
      include: {
        publisher: {
          select: { name: true },
        },
        design: true,
        publications: {
          orderBy: { kyDate: 'desc' },
          include: {
            coverImage: {
              select: { url: true },
            },
            _count: {
              select: { contents: true },
            },
          },
        },
      },
    })

    const series = allSeries.find(s => slugify(s.name) === slug)

    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 })
    }

    // Format response
    const result = {
      id: series.id,
      name: series.name,
      type: series.type,
      description: series.description,
      publisherName: series.publisher?.name ?? null,
      frequency: series.frequency,
      startKyDate: series.startKyDate,
      endKyDate: series.endKyDate,
      hasDesign: !!series.design,
      issues: series.publications.map(pub => ({
        id: pub.id,
        title: pub.title,
        kyDate: pub.kyDate,
        coverUrl: pub.coverImage?.url ?? null,
        volume: pub.volume,
        issueNumber: pub.issueNumber,
        edition: pub.edition,
        contentCount: pub._count.contents,
        hasContent: pub._count.contents > 0,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch series:', error)
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const series = await prisma.publicationSeries.findMany({
      where: {
        type: { in: ['magazine', 'newspaper'] },
      },
      include: {
        publisher: {
          select: { name: true },
        },
        _count: {
          select: { publications: true },
        },
        publications: {
          orderBy: { kyDate: 'desc' },
          take: 1,
          include: {
            coverImage: {
              select: { url: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const result = series.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      description: s.description,
      publisherName: s.publisher?.name ?? null,
      issueCount: s._count.publications,
      latestCoverUrl: s.publications[0]?.coverImage?.url ?? null,
      latestIssueTitle: s.publications[0]?.title ?? null,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch publication series:', error)
    return NextResponse.json({ error: 'Failed to fetch publication series' }, { status: 500 })
  }
}

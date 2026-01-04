import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Find the latest kyDate across all media tables
    const [latestAudio, latestVideo, latestImage, latestAlbum] = await Promise.all([
      prisma.audio.findFirst({
        where: { kyDate: { not: null } },
        orderBy: { kyDate: 'desc' },
        select: { kyDate: true }
      }),
      prisma.video.findFirst({
        where: { kyDate: { not: null } },
        orderBy: { kyDate: 'desc' },
        select: { kyDate: true }
      }),
      prisma.image.findFirst({
        where: { kyDate: { not: null } },
        orderBy: { kyDate: 'desc' },
        select: { kyDate: true }
      }),
      prisma.album.findFirst({
        where: { kyDate: { not: null } },
        orderBy: { kyDate: 'desc' },
        select: { kyDate: true }
      })
    ])

    // Get the maximum date
    const dates = [
      latestAudio?.kyDate,
      latestVideo?.kyDate,
      latestImage?.kyDate,
      latestAlbum?.kyDate
    ].filter((d): d is Date => d !== null)

    let latestMonth = 3
    let latestYear = 1949

    if (dates.length > 0) {
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
      latestMonth = maxDate.getMonth() + 1 // JS months are 0-indexed
      latestYear = maxDate.getFullYear()
    }

    return NextResponse.json({
      earliestMonth: 1,
      earliestYear: 1949,
      latestMonth,
      latestYear
    })
  } catch (error) {
    console.error('Failed to get KY date range:', error)
    return NextResponse.json(
      { error: 'Failed to get date range' },
      { status: 500 }
    )
  }
}

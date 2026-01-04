import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default values if settings don't exist
const DEFAULTS = {
  earliestMonth: 1,
  earliestYear: 1949,
  latestMonth: 12,
  latestYear: 1950,
}

export async function GET() {
  try {
    // Fetch all date range settings from the database
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'kyDateRangeEarliestMonth',
            'kyDateRangeEarliestYear',
            'kyDateRangeLatestMonth',
            'kyDateRangeLatestYear',
          ],
        },
      },
    })

    // Convert to a map for easy lookup
    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    // Parse settings or use defaults
    const earliestMonth = settingsMap.kyDateRangeEarliestMonth
      ? parseInt(settingsMap.kyDateRangeEarliestMonth, 10)
      : DEFAULTS.earliestMonth
    const earliestYear = settingsMap.kyDateRangeEarliestYear
      ? parseInt(settingsMap.kyDateRangeEarliestYear, 10)
      : DEFAULTS.earliestYear
    const latestMonth = settingsMap.kyDateRangeLatestMonth
      ? parseInt(settingsMap.kyDateRangeLatestMonth, 10)
      : DEFAULTS.latestMonth
    const latestYear = settingsMap.kyDateRangeLatestYear
      ? parseInt(settingsMap.kyDateRangeLatestYear, 10)
      : DEFAULTS.latestYear

    return NextResponse.json({
      earliestMonth,
      earliestYear,
      latestMonth,
      latestYear,
    })
  } catch (error) {
    console.error('Failed to get KY date range:', error)
    return NextResponse.json(
      { error: 'Failed to get date range' },
      { status: 500 }
    )
  }
}

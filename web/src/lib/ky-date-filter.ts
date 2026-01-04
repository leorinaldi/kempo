/**
 * Utilities for filtering media by Kempo Year (KY) date
 */

/**
 * Parse a KY date query parameter (format: "YYYY-MM") into a Date object
 * representing the end of that month.
 */
export function parseKYDateParam(ky: string | null): Date | null {
  if (!ky) return null

  const parts = ky.split('-')
  if (parts.length !== 2) return null

  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return null

  // End of the selected month (day 0 of next month = last day of this month)
  return new Date(year, month, 0, 23, 59, 59, 999)
}

/**
 * Build a Prisma where clause for filtering by kyDate.
 * Returns empty object if no maxDate, allowing spread syntax.
 */
export function kyDateFilter(maxDate: Date | null): { kyDate?: { lte: Date } } {
  if (!maxDate) return {}
  return { kyDate: { lte: maxDate } }
}

/**
 * Build a Prisma where clause for filtering nested video.kyDate.
 * Returns empty object if no maxDate.
 */
export function videoKyDateFilter(maxDate: Date | null): { video?: { kyDate: { lte: Date } } } {
  if (!maxDate) return {}
  return { video: { kyDate: { lte: maxDate } } }
}

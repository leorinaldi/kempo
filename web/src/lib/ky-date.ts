import { cookies } from 'next/headers'

const COOKIE_NAME = 'kempo-ky-date'

/**
 * Read the KY date from the cookie in a server component.
 * Cookie format: "1948-06" -> {month: 6, year: 1948}
 */
export async function getKYDateFromCookie(): Promise<{ month: number; year: number } | undefined> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)

  if (!cookie?.value) return undefined

  // Parse "1948-06" format
  const [yearStr, monthStr] = cookie.value.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  if (isNaN(year) || isNaN(month)) return undefined

  return { year, month }
}

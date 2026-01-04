'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface KYDateContextType {
  kyDate: { month: number; year: number } | null
  setKYDate: (date: { month: number; year: number }) => void
  latestDate: { month: number; year: number } | null
  earliestDate: { month: number; year: number }
  isLoading: boolean
}

const KYDateContext = createContext<KYDateContextType | undefined>(undefined)

const EARLIEST_DATE = { month: 1, year: 1948 }
const STORAGE_KEY = 'kempo-ky-date'
const COOKIE_NAME = 'kempo-ky-date'

// Helper to set the cookie (format: "1948-06")
function setKYDateCookie(date: { month: number; year: number }) {
  const value = `${date.year}-${String(date.month).padStart(2, '0')}`
  // Set cookie with 1 year expiry, accessible to all paths
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

export function KYDateProvider({ children }: { children: ReactNode }) {
  const [kyDate, setKYDateState] = useState<{ month: number; year: number } | null>(null)
  const [latestDate, setLatestDate] = useState<{ month: number; year: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch latest media date and initialize
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/ky-date/range')
        const data = await res.json()

        const latest = {
          month: data.latestMonth,
          year: data.latestYear
        }
        setLatestDate(latest)

        // Check localStorage for saved date
        const saved = localStorage.getItem(STORAGE_KEY)
        let dateToUse = latest
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            // Validate saved date is within range
            if (isDateInRange(parsed, EARLIEST_DATE, latest)) {
              dateToUse = parsed
            }
          } catch {
            // Use latest as fallback
          }
        }
        setKYDateState(dateToUse)
        setKYDateCookie(dateToUse)
      } catch (error) {
        console.error('Failed to fetch KY date range:', error)
        // Fallback to a reasonable default
        const fallback = { month: 3, year: 1949 }
        setLatestDate(fallback)
        setKYDateState(fallback)
        setKYDateCookie(fallback)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (latestDate && isDateInRange(parsed, EARLIEST_DATE, latestDate)) {
            setKYDateState(parsed)
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [latestDate])

  const setKYDate = (date: { month: number; year: number }) => {
    setKYDateState(date)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(date))
    setKYDateCookie(date)
  }

  return (
    <KYDateContext.Provider value={{
      kyDate,
      setKYDate,
      latestDate,
      earliestDate: EARLIEST_DATE,
      isLoading
    }}>
      {children}
    </KYDateContext.Provider>
  )
}

export function useKYDate() {
  const context = useContext(KYDateContext)
  if (context === undefined) {
    throw new Error('useKYDate must be used within a KYDateProvider')
  }
  return context
}

// Helper to check if a date is within range
function isDateInRange(
  date: { month: number; year: number },
  earliest: { month: number; year: number },
  latest: { month: number; year: number }
): boolean {
  const dateValue = date.year * 12 + date.month
  const earliestValue = earliest.year * 12 + earliest.month
  const latestValue = latest.year * 12 + latest.month
  return dateValue >= earliestValue && dateValue <= latestValue
}

// Helper to format date for display
export function formatKYDate(date: { month: number; year: number }): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${months[date.month - 1]} ${date.year}`
}

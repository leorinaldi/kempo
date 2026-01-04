'use client'

import { useState, useRef, useEffect } from 'react'
import { useKYDate, formatKYDate } from '@/context/KYDateContext'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

interface KYDatePickerProps {
  variant?: 'home' | 'header'
}

export function KYDatePicker({ variant = 'header' }: KYDatePickerProps) {
  const { kyDate, setKYDate, earliestDate, latestDate, isLoading } = useKYDate()
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading || !kyDate || !latestDate) {
    return (
      <div className={variant === 'home' ? 'text-2xl text-gray-400' : 'text-sm text-gray-400'}>
        ...
      </div>
    )
  }

  const canGoEarlier = () => {
    if (kyDate.month === 1) {
      return kyDate.year > earliestDate.year
    }
    return kyDate.year > earliestDate.year || kyDate.month > earliestDate.month
  }

  const canGoLater = () => {
    if (kyDate.month === 12) {
      return kyDate.year < latestDate.year
    }
    return kyDate.year < latestDate.year || kyDate.month < latestDate.month
  }

  const adjustMonth = (delta: number) => {
    let newMonth = kyDate.month + delta
    let newYear = kyDate.year

    if (newMonth < 1) {
      newMonth = 12
      newYear--
    } else if (newMonth > 12) {
      newMonth = 1
      newYear++
    }

    // Clamp to range
    if (newYear < earliestDate.year || (newYear === earliestDate.year && newMonth < earliestDate.month)) {
      return
    }
    if (newYear > latestDate.year || (newYear === latestDate.year && newMonth > latestDate.month)) {
      return
    }

    setKYDate({ month: newMonth, year: newYear })
  }

  const adjustYear = (delta: number) => {
    const newYear = kyDate.year + delta
    let newMonth = kyDate.month

    // Clamp month if at boundaries
    if (newYear === earliestDate.year && newMonth < earliestDate.month) {
      newMonth = earliestDate.month
    }
    if (newYear === latestDate.year && newMonth > latestDate.month) {
      newMonth = latestDate.month
    }

    // Check year bounds
    if (newYear < earliestDate.year || newYear > latestDate.year) {
      return
    }

    setKYDate({ month: newMonth, year: newYear })
  }

  const isHome = variant === 'home'

  const blueGlow = '0 0 10px rgba(100,150,255,1), 0 0 20px rgba(80,130,255,0.8)'

  return (
    <div ref={pickerRef} className="relative">
      {/* Display - clickable to open picker */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${isHome
            ? 'text-2xl tracking-[0.15em] text-white font-light'
            : 'text-sm tracking-[0.1em] text-white/90'
          }
          transition-opacity duration-200 hover:opacity-70
        `}
        style={isHome ? { textShadow: blueGlow } : undefined}
      >
        {formatKYDate(kyDate)}
      </button>

      {/* Picker dropdown */}
      {isOpen && (
        <div
          className={`
            absolute z-[100] mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl
            ${isHome ? 'left-1/2 -translate-x-1/2' : 'right-0'}
          `}
          style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(100,150,255,0.2)' }}
        >
          <div className="p-3 flex gap-4">
            {/* Month stepper */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustMonth(-1)}
                disabled={!canGoEarlier()}
                className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ◀
              </button>
              <span className="text-white w-10 text-center font-mono">
                {MONTHS[kyDate.month - 1]}
              </span>
              <button
                onClick={() => adjustMonth(1)}
                disabled={!canGoLater()}
                className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>

            {/* Year stepper */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustYear(-1)}
                disabled={kyDate.year <= earliestDate.year}
                className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ◀
              </button>
              <span className="text-white w-12 text-center font-mono">
                {kyDate.year}
              </span>
              <button
                onClick={() => adjustYear(1)}
                disabled={kyDate.year >= latestDate.year}
                className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

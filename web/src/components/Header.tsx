'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

export function Header() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const isInKempoNet = searchParams.get('kemponet') === '1'

  // Check if we're on a kemponet subpage (but not the main kemponet page itself)
  const isKempoNetSubpage = pathname.startsWith('/kemponet/') && pathname !== '/kemponet'

  // Convert current path to kttp:// URL for the KempoScape link
  const kttpUrl = pathname.replace(/^\/kemponet\//, 'kttp://')

  // Hide header on home page and when inside KempoNet browser
  if (pathname === '/' || isInKempoNet) {
    return null
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black px-6 py-3 flex items-center justify-between"
        style={{
          boxShadow: '0 4px 20px rgba(80,130,255,0.4), 0 2px 10px rgba(100,150,255,0.3)'
        }}
      >
        <Link
          href="/"
          className="text-2xl font-serif text-white tracking-[0.2em] uppercase hover:opacity-80 transition-opacity"
          style={{
            textShadow: '0 0 10px rgba(100,150,255,1), 0 0 20px rgba(80,130,255,0.9), 0 0 30px rgba(60,120,255,0.8), 0 0 50px rgba(50,100,255,0.6)'
          }}
        >
          KEMPO
        </Link>

        {/* KempoScape Navigator button - only show on kemponet subpages */}
        {isKempoNetSubpage && (
          <Link
            href={`/pc?url=${encodeURIComponent(kttpUrl)}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="View in KempoScape Navigator"
          >
            {/* Compass icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center relative border-2 border-gray-700"
              style={{
                background: '#3b82f6',
                boxShadow: '0 0 10px rgba(59,130,246,0.5)'
              }}
            >
              {/* Compass points */}
              <div className="absolute w-full h-full">
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-yellow-400 rounded-sm"></div>
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-yellow-400 rounded-sm"></div>
                <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1 bg-yellow-400 rounded-sm"></div>
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1 bg-yellow-400 rounded-sm"></div>
              </div>
              {/* K in center */}
              <span className="text-white font-bold text-xs z-10">K</span>
            </div>
          </Link>
        )}
      </header>
      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-14" />
    </>
  )
}

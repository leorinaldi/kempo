'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

export function Header() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isInIframe, setIsInIframe] = useState(false)

  const isInKempoNet = searchParams.get('kemponet') === '1'
  const isInMobile = searchParams.get('mobile') === '1'

  // Check if we're inside an iframe (mobile browser or kemponet PC)
  useEffect(() => {
    setIsInIframe(window.self !== window.top)
  }, [])

  // Check if we're on a kemponet subpage (but not the main kemponet page itself)
  const isKempoNetSubpage = pathname.startsWith('/kemponet/') && pathname !== '/kemponet'

  // Convert current path to kttp:// URL for the KempoNet link
  const kttpUrl = pathname.replace(/^\/kemponet\//, 'kttp://')

  // Hide header on home page, inside KempoNet/Mobile browser, or in any iframe
  if (pathname === '/' || isInKempoNet || isInMobile || isInIframe) {
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

        {/* KempoNet button - only show on kemponet subpages */}
        {isKempoNetSubpage && (
          <Link
            href={`/pc?url=${encodeURIComponent(kttpUrl)}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="View in KempoNet"
          >
            {/* Compass icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3), 0 0 10px rgba(59,130,246,0.5)'
              }}
            >
              {/* Compass needle - pointing NE */}
              <div className="absolute w-5 h-5 -rotate-45">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderBottom: '10px solid white',
                  }}
                />
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderTop: '10px solid rgba(255,255,255,0.4)',
                  }}
                />
              </div>
              {/* Center dot */}
              <div className="absolute w-1.5 h-1.5 rounded-full bg-white z-10" />
            </div>
          </Link>
        )}
      </header>
      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-14" />
    </>
  )
}

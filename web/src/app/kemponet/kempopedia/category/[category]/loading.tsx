import { KempopediaHeader } from '@/components/KempopediaHeader'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <KempopediaHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>

          {/* Article list skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded" style={{ width: `${120 + (i * 20) % 100}px` }}></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

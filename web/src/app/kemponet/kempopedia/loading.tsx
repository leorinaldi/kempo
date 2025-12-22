import { KempopediaHeader } from '@/components/KempopediaHeader'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <KempopediaHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-8">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Section title skeleton */}
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>

          {/* Categories grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-gray-200 rounded p-4">
                <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

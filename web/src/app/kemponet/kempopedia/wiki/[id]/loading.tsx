import { KempopediaHeader } from '@/components/KempopediaHeader'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <KempopediaHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Infobox skeleton */}
          <div className="float-right w-64 ml-4 mb-4 hidden sm:block">
            <div className="border border-gray-300 bg-gray-50 p-3">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-40 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>

          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </main>
    </div>
  )
}

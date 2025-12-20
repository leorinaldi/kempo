export default function GiggleNetPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f5f0" }}>
      {/* Header */}
      <div
        className="border-b-4 border-orange-800 px-6 py-4"
        style={{ background: "linear-gradient(180deg, #f97316 0%, #ea580c 100%)" }}
      >
        <div className="flex items-center gap-4">
          {/* GiggleNet logo - stylized G */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white"
            style={{ background: "linear-gradient(135deg, #fdba74 0%, #f97316 100%)" }}
          >
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "serif", textShadow: "1px 1px 0 rgba(0,0,0,0.2)" }}>G</span>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}>
              GiggleNet
            </h1>
            <p className="text-orange-100 text-sm">Organizing the world&apos;s information</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Welcome section */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#f97316" }}>
            Welcome to GiggleNet
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            GiggleNet is a leading KempoNet company specializing in search technology, online
            information, and digital content. Our mission is to organize the world&apos;s information
            and make it universally accessible and useful.
          </p>
          <p className="text-sm text-gray-700">
            From search to encyclopedias to video, GiggleNet is at the forefront of the
            information superhighway revolution.
          </p>
        </div>

        {/* Products section */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h3 className="font-bold mb-4 pb-2 border-b-2 border-gray-300">Our Services</h3>

          {/* Giggle Search */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center">
                <span className="text-xl font-bold" style={{ fontFamily: "serif" }}>
                  <span style={{ color: "#f97316" }}>G</span>
                  <span style={{ color: "#fdba74" }}>iggle</span>
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              The world&apos;s most popular search engine. Find anything on the KempoNet with
              lightning-fast results and unmatched accuracy. Giggle indexes millions of pages
              to bring you the information you need.
            </p>
            <a href="/kemponet/giggle?kemponet=1" className="text-sm text-red-600 underline hover:text-red-800">
              → Search with Giggle
            </a>
          </div>

          {/* Kempopedia */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: "#f97316" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h4 className="font-bold" style={{ color: "#f97316" }}>Kempopedia</h4>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              The free encyclopedia that anyone can edit. Kempopedia contains articles on
              people, places, events, and everything else in our world. A collaborative
              effort to document all human knowledge.
            </p>
            <a href="/kemponet/kempopedia?kemponet=1" className="text-sm text-red-600 underline hover:text-red-800">
              → Browse Kempopedia
            </a>
          </div>

          {/* KempoTube */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: "#f97316" }}
              >
                <svg width="18" height="12" viewBox="0 0 22 16" fill="white">
                  <path d="M0 0L7 8L0 16V0Z" />
                  <path d="M8 0L15 8L8 16V0Z" />
                  <rect x="18" y="0" width="3" height="16" />
                </svg>
              </div>
              <h4 className="font-bold" style={{ color: "#f97316" }}>KempoTube</h4>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Watch, share, and discover videos from around the world. KempoTube is the
              premier destination for online video content, from music to news to entertainment.
            </p>
            <a href="/kemponet/kempotube?kemponet=1" className="text-sm text-red-600 underline hover:text-red-800">
              → Watch on KempoTube
            </a>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h3 className="font-bold mb-3 pb-2 border-b-2 border-gray-300">Company Information</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="font-bold">Headquarters:</span> Summerview, CA</p>
            <p><span className="font-bold">Founded:</span> 1998 k.y.</p>
            <p><span className="font-bold">Industry:</span> KempoNet Services &amp; Technology</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© GiggleNet Inc. All rights reserved.</p>
          <p>Giggle, Kempopedia, and KempoTube are trademarks of GiggleNet Inc.</p>
        </div>
      </div>
    </div>
  )
}

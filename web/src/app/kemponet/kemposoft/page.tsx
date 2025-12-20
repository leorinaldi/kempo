export default function KemposoftPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f5f0" }}>
      {/* Header */}
      <div
        className="border-b-4 border-gray-900 px-6 py-4"
        style={{ background: "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)" }}
      >
        <div className="flex items-center gap-4">
          {/* Kemposoft logo - 4 square grid like Windows */}
          <div className="grid grid-cols-2 gap-0.5 w-12 h-12 transform -rotate-6 border-2 border-white">
            <div style={{ background: "#60a5fa" }}></div>
            <div style={{ background: "#93c5fd" }}></div>
            <div style={{ background: "#93c5fd" }}></div>
            <div style={{ background: "#60a5fa" }}></div>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}>
              KempoSoft Corporation
            </h1>
            <p className="text-blue-200 text-sm">Where do you think you&apos;re going?</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Welcome section */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#1e40af" }}>
            Welcome to KempoSoft
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            KempoSoft Corporation is a leading software company dedicated to empowering people
            and organizations around the world to achieve more. From personal computers to mobile
            devices, we build the software that powers your digital life.
          </p>
          <p className="text-sm text-gray-700">
            Founded in Portland, Oregon, KempoSoft has grown to become one of the world&apos;s
            most innovative technology companies.
          </p>
        </div>

        {/* Products section */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h3 className="font-bold mb-4 pb-2 border-b-2 border-gray-300">Our Products</h3>

          {/* Kemposoft Portals */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid grid-cols-2 gap-px w-8 h-8 border border-gray-900">
                <div style={{ background: "#1e3a8a" }}></div>
                <div style={{ background: "#7dd3fc" }}></div>
                <div style={{ background: "#7dd3fc" }}></div>
                <div style={{ background: "#1e3a8a" }}></div>
              </div>
              <h4 className="font-bold" style={{ color: "#1e40af" }}>KempoSoft Portals</h4>
            </div>
            <p className="text-sm text-gray-700">
              The world&apos;s leading operating system for personal computers. KempoSoft Portals
              provides a powerful, intuitive interface for work and play. Now featuring enhanced
              multimedia support and seamless internet connectivity.
            </p>
          </div>

          {/* KempoNet Browser */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
                }}
              >
                <div className="absolute w-5 h-5 -rotate-45">
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: 0, height: 0,
                      borderLeft: '3px solid transparent',
                      borderRight: '3px solid transparent',
                      borderBottom: '10px solid white',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: 0, height: 0,
                      borderLeft: '3px solid transparent',
                      borderRight: '3px solid transparent',
                      borderTop: '10px solid rgba(255,255,255,0.4)',
                    }}
                  />
                </div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-white z-10" />
              </div>
              <h4 className="font-bold" style={{ color: "#1e40af" }}>KempoNet Browser</h4>
            </div>
            <p className="text-sm text-gray-700">
              Your window to the World Wide Web. KempoNet Browser delivers fast, secure browsing
              with support for the latest web technologies. Explore the information superhighway
              with confidence.
            </p>
            <a href="/kemponet/kemponet-browser?kemponet=1" className="text-sm text-blue-700 underline hover:text-blue-900">
              → Download KempoNet Browser
            </a>
          </div>

          {/* Kemposoft Mobile OS */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
                }}
              >
                <div className="w-4 h-6 rounded border-2 border-white" />
              </div>
              <h4 className="font-bold" style={{ color: "#1e40af" }}>KempoSoft Mobile OS</h4>
            </div>
            <p className="text-sm text-gray-700">
              The leading operating system for mobile phones and handheld devices. KempoSoft Mobile OS
              brings the power of KempoSoft to your pocket, with seamless synchronization to your
              desktop PC.
            </p>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h3 className="font-bold mb-3 pb-2 border-b-2 border-gray-300">Company Information</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="font-bold">Headquarters:</span> Portland, Oregon</p>
            <p><span className="font-bold">Founded:</span> 1975 k.y.</p>
            <p><span className="font-bold">Industry:</span> Computer Software</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© KempoSoft Corporation. All rights reserved.</p>
          <p>KempoSoft, Portals, and KempoNet are trademarks of KempoSoft Corporation.</p>
        </div>
      </div>
    </div>
  )
}

import { Domain, Page } from "@prisma/client"
import ReactMarkdown from "react-markdown"

interface CorporateMetadata {
  tagline?: string
  headerGradient?: string
  headerBorderColor?: string
  accentColor?: string
  logoType?: "letter" | "grid" | "compass" | "kempaq"
  logoLetter?: string
  companyInfo?: {
    headquarters?: string
    founded?: string
    industry?: string
  }
  services?: Array<{
    name: string
    icon?: string
    iconColor?: string
    description: string
    link?: string
    linkText?: string
  }>
  footer?: string
}

interface CorporateTemplateProps {
  page: Page & { domain: Domain }
  domain: Domain
}

export function CorporateTemplate({ page, domain }: CorporateTemplateProps) {
  const metadata = (page.metadata || {}) as CorporateMetadata
  const displayName = domain.displayName || domain.name
  const accentColor = metadata.accentColor || "#1e40af"

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f0" }}>
      {/* Header */}
      <div
        className="border-b-4 px-6 py-4"
        style={{
          background: metadata.headerGradient || "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
          borderColor: metadata.headerBorderColor || "#1e3a8a",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          {metadata.logoType === "letter" ? (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white"
              style={{ background: `linear-gradient(135deg, ${accentColor}80 0%, ${accentColor} 100%)` }}
            >
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "serif", textShadow: "1px 1px 0 rgba(0,0,0,0.2)" }}
              >
                {metadata.logoLetter || displayName.charAt(0)}
              </span>
            </div>
          ) : metadata.logoType === "grid" ? (
            <div className="grid grid-cols-2 gap-0.5 w-12 h-12 transform -rotate-6 border-2 border-white">
              <div style={{ background: "#60a5fa" }}></div>
              <div style={{ background: "#93c5fd" }}></div>
              <div style={{ background: "#93c5fd" }}></div>
              <div style={{ background: "#60a5fa" }}></div>
            </div>
          ) : metadata.logoType === "kempaq" ? (
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                {/* Monitor frame */}
                <rect x="6" y="6" width="36" height="28" rx="2" fill="white" stroke="white" strokeWidth="2"/>
                {/* Screen */}
                <rect x="9" y="9" width="30" height="22" rx="1" fill={accentColor}/>
                {/* Circuit lines on screen */}
                <path d="M12 15h8l3 3h13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 20h5l2 2h4l2-2h11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 25h10l2-2h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Stand */}
                <rect x="20" y="34" width="8" height="3" fill="white"/>
                <rect x="16" y="37" width="16" height="3" rx="1" fill="white"/>
              </svg>
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${accentColor}80 0%, ${accentColor} 100%)`,
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4), 0 0 0 3px white",
              }}
            >
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "serif", textShadow: "1px 1px 0 rgba(0,0,0,0.2)" }}
              >
                {displayName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1
              className="text-white text-2xl font-bold"
              style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}
            >
              {displayName}
            </h1>
            {metadata.tagline && (
              <p className="text-white/80 text-sm">{metadata.tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Main content from markdown */}
        <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
          <h2 className="text-lg font-bold mb-2" style={{ color: accentColor }}>
            {page.title}
          </h2>
          <div className="text-sm text-gray-700 prose prose-sm max-w-none">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>
        </div>

        {/* Services section */}
        {metadata.services && metadata.services.length > 0 && (
          <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
            <h3 className="font-bold mb-4 pb-2 border-b-2 border-gray-300">Our Services</h3>
            {metadata.services.map((service, index) => (
              <div
                key={service.name}
                className={index < metadata.services!.length - 1 ? "mb-4 pb-4 border-b border-gray-200" : ""}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: service.iconColor || accentColor }}
                  >
                    {service.icon === "search" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                      </svg>
                    ) : service.icon === "book" ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    ) : service.icon === "video" ? (
                      <svg width="18" height="12" viewBox="0 0 22 16" fill="white">
                        <path d="M0 0L7 8L0 16V0Z" />
                        <path d="M8 0L15 8L8 16V0Z" />
                        <rect x="18" y="0" width="3" height="16" />
                      </svg>
                    ) : service.icon === "flipflop" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 4l-8 8h5v8h6v-8h5z" />
                      </svg>
                    ) : service.icon === "computer" ? (
                      <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    ) : service.icon === "chip" ? (
                      <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                      </svg>
                    ) : service.icon === "server" ? (
                      <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                      </svg>
                    ) : service.icon === "grid" ? (
                      <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                        <div className="bg-white"></div>
                        <div className="bg-white/60"></div>
                        <div className="bg-white/60"></div>
                        <div className="bg-white"></div>
                      </div>
                    ) : service.icon === "compass" ? (
                      <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    ) : service.icon === "phone" ? (
                      <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                    ) : (
                      <span className="text-white font-bold">{service.name.charAt(0)}</span>
                    )}
                  </div>
                  <h4 className="font-bold" style={{ color: service.iconColor || accentColor }}>
                    {service.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 mb-2">{service.description}</p>
                {service.link && (
                  <a
                    href={`${service.link}?kemponet=1`}
                    className="text-sm underline hover:opacity-80"
                    style={{ color: accentColor === "#f97316" ? "#dc2626" : "#1d4ed8" }}
                  >
                    {service.linkText || `Visit ${service.name}`}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Company Info */}
        {metadata.companyInfo && (
          <div className="mb-8 p-4 border-2 border-gray-900 bg-white">
            <h3 className="font-bold mb-3 pb-2 border-b-2 border-gray-300">Company Information</h3>
            <div className="text-sm text-gray-700 space-y-1">
              {metadata.companyInfo.headquarters && (
                <p><span className="font-bold">Headquarters:</span> {metadata.companyInfo.headquarters}</p>
              )}
              {metadata.companyInfo.founded && (
                <p><span className="font-bold">Founded:</span> {metadata.companyInfo.founded}</p>
              )}
              {metadata.companyInfo.industry && (
                <p><span className="font-bold">Industry:</span> {metadata.companyInfo.industry}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          {metadata.footer ? (
            <div dangerouslySetInnerHTML={{ __html: metadata.footer }} />
          ) : (
            <p>&copy; {displayName}. All rights reserved.</p>
          )}
        </div>
      </div>
    </div>
  )
}

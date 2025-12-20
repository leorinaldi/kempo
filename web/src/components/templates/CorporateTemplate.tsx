import { Domain, Page } from "@prisma/client"
import ReactMarkdown from "react-markdown"

interface CorporateMetadata {
  tagline?: string
  headerGradient?: string
  headerBorderColor?: string
  accentColor?: string
  logoType?: "letter" | "grid" | "compass"
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

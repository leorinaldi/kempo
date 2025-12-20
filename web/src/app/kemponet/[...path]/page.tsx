import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CorporateTemplate } from "@/components/templates/CorporateTemplate"

interface PageProps {
  params: Promise<{ path: string[] }>
}

export default async function ContentPage({ params }: PageProps) {
  const { path } = await params

  // First segment is the domain, rest is the slug
  const domainName = path[0]
  const slug = path.slice(1).join("/") || ""

  // Find the domain
  const domain = await prisma.domain.findUnique({
    where: { name: domainName },
  })

  // If domain doesn't exist or is an app, return 404
  // (app domains have their own dedicated routes)
  if (!domain || domain.type === "app") {
    notFound()
  }

  // Find the page
  const page = await prisma.page.findUnique({
    where: {
      domainId_slug: {
        domainId: domain.id,
        slug: slug,
      },
    },
    include: {
      domain: true,
    },
  })

  if (!page) {
    notFound()
  }

  // Render based on template
  const template = page.template || "default"

  if (template === "corporate") {
    return (
      <CorporateTemplate
        page={page}
        domain={domain}
      />
    )
  }

  // Default template - simple rendering
  return (
    <CorporateTemplate
      page={page}
      domain={domain}
    />
  )
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { path } = await params
  const domainName = path[0]
  const slug = path.slice(1).join("/") || ""

  const domain = await prisma.domain.findUnique({
    where: { name: domainName },
  })

  if (!domain || domain.type === "app") {
    return { title: "Not Found" }
  }

  const page = await prisma.page.findUnique({
    where: {
      domainId_slug: {
        domainId: domain.id,
        slug: slug,
      },
    },
  })

  if (!page) {
    return { title: "Not Found" }
  }

  return {
    title: `${page.title} - ${domain.displayName || domain.name}`,
  }
}

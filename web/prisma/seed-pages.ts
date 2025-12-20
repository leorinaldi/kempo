import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get domain IDs
  const gigglenet = await prisma.domain.findUnique({ where: { name: 'gigglenet' } })
  const kemposoft = await prisma.domain.findUnique({ where: { name: 'kemposoft' } })

  if (!gigglenet || !kemposoft) {
    console.error('Domains not found')
    return
  }

  // Create GiggleNet home page
  await prisma.page.upsert({
    where: {
      domainId_slug: { domainId: gigglenet.id, slug: '' }
    },
    update: {},
    create: {
      domainId: gigglenet.id,
      slug: '',
      title: 'Welcome to GiggleNet',
      content: `GiggleNet is a leading KempoNet company specializing in search technology, online information, and digital content. Our mission is to organize the world's information and make it universally accessible and useful.

From search to encyclopedias to video, GiggleNet is at the forefront of the information superhighway revolution.`,
      excerpt: "GiggleNet - Organizing the world's information. Leading KempoNet company for search, encyclopedias, and digital content.",
      template: 'corporate',
      metadata: {
        tagline: "Organizing the world's information",
        headerGradient: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
        headerBorderColor: '#c2410c',
        accentColor: '#f97316',
        logoType: 'letter',
        logoLetter: 'G',
        services: [
          {
            name: 'Giggle',
            icon: 'search',
            iconColor: '#f97316',
            description: "The world's most popular search engine. Find anything on the KempoNet with lightning-fast results and unmatched accuracy. Giggle indexes millions of pages to bring you the information you need.",
            link: '/kemponet/giggle',
            linkText: '→ Search with Giggle'
          },
          {
            name: 'Kempopedia',
            icon: 'book',
            iconColor: '#f97316',
            description: 'The free encyclopedia that anyone can edit. Kempopedia contains articles on people, places, events, and everything else in our world. A collaborative effort to document all human knowledge.',
            link: '/kemponet/kempopedia',
            linkText: '→ Browse Kempopedia'
          },
          {
            name: 'KempoTube',
            icon: 'video',
            iconColor: '#f97316',
            description: 'Watch, share, and discover videos from around the world. KempoTube is the premier destination for online video content, from music to news to entertainment.',
            link: '/kemponet/kempotube',
            linkText: '→ Watch on KempoTube'
          },
          {
            name: 'FlipFlop',
            icon: 'flipflop',
            iconColor: '#ec4899',
            description: 'Short-form video entertainment at your fingertips. FlipFlop brings you an endless stream of creative, entertaining, and engaging vertical videos. Just scroll and enjoy.',
            link: '/kemponet/flipflop',
            linkText: '→ Watch on FlipFlop'
          }
        ],
        companyInfo: {
          headquarters: 'Summerview, CA',
          founded: '1998 k.y.',
          industry: 'KempoNet Services & Technology'
        },
        footer: '<p>© GiggleNet Inc. All rights reserved.</p><p>Giggle, Kempopedia, KempoTube, and FlipFlop are trademarks of GiggleNet Inc.</p>'
      }
    }
  })
  console.log('Created GiggleNet home page')

  // Create KempoSoft home page
  await prisma.page.upsert({
    where: {
      domainId_slug: { domainId: kemposoft.id, slug: '' }
    },
    update: {},
    create: {
      domainId: kemposoft.id,
      slug: '',
      title: 'Welcome to KempoSoft',
      content: `KempoSoft Corporation is a leading software company dedicated to empowering people and organizations around the world to achieve more. From personal computers to mobile devices, we build the software that powers your digital life.

Founded in Portland, Oregon, KempoSoft has grown to become one of the world's most innovative technology companies.`,
      excerpt: 'KempoSoft Corporation - Building the software that powers your digital life. Leading software company for operating systems and browsers.',
      template: 'corporate',
      metadata: {
        tagline: "Where do you think you're going?",
        headerGradient: 'linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)',
        headerBorderColor: '#1e3a8a',
        accentColor: '#1e40af',
        logoType: 'grid',
        services: [
          {
            name: 'KempoSoft Portals',
            icon: 'grid',
            iconColor: '#1e40af',
            description: "The world's leading operating system for personal computers. KempoSoft Portals provides a powerful, intuitive interface for work and play. Now featuring enhanced multimedia support and seamless internet connectivity."
          },
          {
            name: 'KempoNet Browser',
            icon: 'compass',
            iconColor: '#1e40af',
            description: 'Your window to the World Wide Web. KempoNet Browser delivers fast, secure browsing with support for the latest web technologies. Explore the information superhighway with confidence.',
            link: '/kemponet/kemponet-browser',
            linkText: '→ Download KempoNet Browser'
          },
          {
            name: 'KempoSoft Mobile OS',
            icon: 'phone',
            iconColor: '#1e40af',
            description: 'The leading operating system for mobile phones and handheld devices. KempoSoft Mobile OS brings the power of KempoSoft to your pocket, with seamless synchronization to your desktop PC.'
          }
        ],
        companyInfo: {
          headquarters: 'Portland, Oregon',
          founded: '1975 k.y.',
          industry: 'Computer Software'
        },
        footer: '<p>© KempoSoft Corporation. All rights reserved.</p><p>KempoSoft, Portals, and KempoNet are trademarks of KempoSoft Corporation.</p>'
      }
    }
  })
  console.log('Created KempoSoft home page')

  console.log('\nAll pages:')
  const pages = await prisma.page.findMany({ include: { domain: true } })
  pages.forEach(p => console.log(' ', p.domain.name + '/' + p.slug, '-', p.title))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

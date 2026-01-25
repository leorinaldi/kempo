const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  // Create the organization
  const org = await prisma.organization.create({
    data: {
      name: 'Atlantic University',
      abbreviation: 'AU',
      orgType: 'university',
      dateFounded: new Date('1851-09-15')
    }
  });
  console.log('Created organization:', org.name, '(ID:', org.id, ')');

  const content = `**Atlantic University** is a private research university in [[New York City]] and a member of the [[Gothic League]]. Founded in 1851 by merchant and philanthropist Cornelius Van Dorn, Atlantic has grown from a reformist experiment in accessible education into one of America's most prestigious institutions.

## History

### Founding

Atlantic University was founded in [[1851 k.y.]] by Cornelius Van Dorn, a wealthy merchant who had grown rich in the transatlantic trade. Van Dorn, himself the son of Dutch immigrants, believed that America's future depended on educating capable young people regardless of their family's wealth or social standing.

His vision was radical for its time: a university that would combine the academic rigor of elite institutions with genuine accessibility. "Where any capable student may find instruction in any worthy study," Van Dorn declared at the university's founding ceremony.

The original campus occupied several buildings near the Battery, symbolically positioned where immigrants first glimpsed America. Van Dorn endowed scholarships for promising students who could not afford tuition, establishing a tradition of opportunity that continues to define the institution.

### Growth and prestige

Through the late 19th century, Atlantic University expanded both its campus and its reputation. The university pioneered practical education alongside traditional liberal arts, establishing early programs in engineering, business, and applied sciences. These innovations attracted students seeking useful knowledge, not merely cultural polish.

By 1900, Atlantic had joined [[New England University]] and the [[University of Philadelphia]] as founding members of the [[Gothic League]], formalizing its status among America's elite institutions. Yet Atlantic retained its distinctive character—more urban, more practical, more accessible than its peers.

### Modern era

In 1950, Atlantic University enrolls approximately 12,000 students across its undergraduate college and graduate schools. The campus has expanded northward through Manhattan, its Gothic spires rising among the city's skyscrapers.

Atlantic's alumni include captains of industry, political leaders, and professionals throughout New York City and beyond. The university takes particular pride in graduates who rose from humble origins to positions of influence—embodying Van Dorn's founding vision.

## Academics

Atlantic University comprises several schools:

- **Atlantic College** — Undergraduate liberal arts and sciences
- **Atlantic Law School** — Legal education
- **Atlantic School of Engineering** — Applied sciences and technology
- **Atlantic Business School** — Commerce and management
- **Atlantic Medical College** — Medical education

## Athletics

Atlantic competes in the [[Gothic League]] across all major sports. The university's athletic teams are known as the **Titans**, and the school colors are navy blue and silver.

## Campus

The Atlantic University campus stretches through lower and midtown Manhattan, its buildings representing over a century of architectural styles unified by Gothic elements that echo the university's academic aspirations. Van Dorn Hall, the original building, remains the symbolic heart of the campus.

## Notable alumni

Atlantic has produced leaders in business, law, medicine, and public service. The university's alumni network is particularly influential in New York City, where Atlantic graduates occupy prominent positions throughout the city's institutions.

## See also

- [[Gothic League]]
- [[New England University]]
- [[University of Philadelphia]]
- [[New York City]]`;

  // Create the article
  const article = await prisma.article.create({
    data: {
      title: 'Atlantic University',
      type: 'organization',
      subtype: 'university',
      status: 'published',
      publishDate: new Date('1950-12-31'),
      tags: ['university', 'gothic-league', 'new-york', 'education'],
      dates: ['September 15, 1851 k.y.'],
      infobox: {
        type: 'organization',
        fields: {
          'Type': 'Private research university',
          'Founded': '[[September 15, 1851 k.y.|1851]]',
          'Founder': 'Cornelius Van Dorn',
          'Location': '[[New York City]], [[New York]]',
          'Affiliation': 'Gothic League',
          'Motto': 'Knowledge for All Who Seek It',
          'Students': '12,000 (1950)'
        }
      },
      content: content
    }
  });
  console.log('Created article:', article.title, '(ID:', article.id, ')');

  // Link article to organization
  await prisma.organization.update({
    where: { id: org.id },
    data: { articleId: article.id }
  });
  console.log('Linked article to organization');

  // Create inspiration records
  await prisma.inspiration.createMany({
    data: [
      {
        subjectId: org.id,
        subjectType: 'organization',
        inspiration: 'Columbia University',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Columbia_University'
      },
      {
        subjectId: org.id,
        subjectType: 'organization',
        inspiration: 'City College of New York',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/City_College_of_New_York'
      },
      {
        subjectId: org.id,
        subjectType: 'organization',
        inspiration: 'New York University',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/New_York_University'
      },
      {
        subjectId: org.id,
        subjectType: 'organization',
        inspiration: 'Cornell University',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Cornell_University'
      }
    ]
  });
  console.log('Created 4 inspiration records');

  console.log('\nOrg ID for image:', org.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());

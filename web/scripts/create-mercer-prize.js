const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  // Create the organization
  const org = await prisma.organization.create({
    data: {
      name: 'Mercer Prize',
      orgType: 'award',
      dateFounded: new Date('1918-06-04')
    }
  });
  console.log('Created organization:', org.name, '(ID:', org.id, ')');

  const content = `The **Mercer Prize** is an annual American award recognizing excellence in journalism, literature, and musical composition. Established in 1918 through a bequest from newspaper magnate [[Randolph Joseph Mercer]], the prizes are administered by [[Atlantic University]] and represent the most prestigious honors in American journalism and letters.

## History

### Founding

The Mercer Prize was established through the will of [[Randolph Joseph Mercer]], who despite his reputation for sensationalist "yellow journalism" sought to elevate the profession he had transformed. Mercer's bequest of $2 million to [[Atlantic University]] in 1911 specified the creation of annual prizes "for distinguished achievement in American journalism, letters, and music."

The first Mercer Prizes were awarded on June 4, 1918, honoring work from the previous year. Mercer himself had died in 1915, never seeing the prizes that would bear his name become the pinnacle of American journalism and literary achievement.

### Growth and prestige

Initially controversial due to Mercer's polarizing legacy, the prizes quickly established themselves as the definitive recognition of excellence. By the 1930s, a Mercer Prize had become the highest honor a journalist or author could receive, shaping careers and canonizing works.

The prizes have evolved over the decades, with new categories added to reflect changes in journalism and the arts. The board has occasionally courted controversy with its selections, but the prestige of the Mercer name has only grown.

## Categories

### Journalism

The Mercer Prizes recognize excellence across multiple journalism categories:

- **Public Service** — Awarded to a newspaper for meritorious public service
- **Reporting** — For distinguished reporting on national or international affairs
- **Editorial Writing** — For distinguished editorial writing
- **Editorial Cartooning** — For distinguished editorial cartooning
- **Photography** — For distinguished photography in journalism

### Letters and Arts

- **Fiction** — For distinguished fiction by an American author
- **Drama** — For distinguished play by an American playwright
- **History** — For distinguished book on American history
- **Biography** — For distinguished biography or autobiography
- **Poetry** — For distinguished volume of verse
- **General Nonfiction** — For distinguished nonfiction by an American author
- **Music** — For distinguished musical composition

## Administration

The Mercer Prizes are administered by [[Atlantic University]] in [[New York City]]. A board of jurors, comprising distinguished journalists, authors, and academics, reviews nominations and selects winners. The university's president announces the prizes each spring.

Winners receive a certificate, a gold medal, and a cash award of $1,000.

## Notable laureates

The Mercer Prize has honored many of America's greatest journalists and writers:

- [[Ernest Beckford]] — Fiction, 1937 (for *The Dispossessed*)

## Cultural impact

The Mercer Prize has shaped American letters and journalism for decades. A Mercer win transforms careers, boosts book sales, and cements reputations. Critics argue the prizes sometimes favor safe choices over innovative work, but the Mercer remains the standard by which American achievement in journalism and literature is measured.

The irony that the prizes were founded by a man synonymous with sensationalism has not been lost on observers. Yet perhaps Mercer understood better than anyone the gap between journalism as practiced and journalism as aspired to—and sought, in death, to close it.

## See also

- [[Randolph Joseph Mercer]]
- [[Atlantic University]]
- [[Ernest Beckford]]
- [[Alfred Prize]] (international equivalent)`;

  // Create the article
  const article = await prisma.article.create({
    data: {
      title: 'Mercer Prize',
      type: 'organization',
      subtype: 'award',
      status: 'published',
      publishDate: new Date('1950-12-31'),
      tags: ['award', 'journalism', 'literature', 'music'],
      dates: ['June 4, 1918 k.y.'],
      infobox: {
        type: 'organization',
        fields: {
          'Type': 'Annual awards',
          'Founded': '[[June 4, 1918 k.y.|1918]]',
          'Founder': '[[Randolph Joseph Mercer]]',
          'Categories': 'Journalism, Fiction, Drama, History, Biography, Poetry, Music',
          'Administered by': '[[Atlantic University]]',
          'Location': '[[New York City]]'
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
        inspiration: 'Pulitzer Prize',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Pulitzer_Prize'
      },
      {
        subjectId: org.id,
        subjectType: 'organization',
        inspiration: 'Joseph Pulitzer',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Joseph_Pulitzer'
      }
    ]
  });
  console.log('Created 2 inspiration records');

  console.log('\nOrg ID for image:', org.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());

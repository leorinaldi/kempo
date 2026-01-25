require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create the article
  const article = await prisma.article.create({
    data: {
      title: 'University of Philadelphia',
      type: 'organization',
      subtype: 'university',
      status: 'published',
      content: `**The University of Philadelphia** is a private research university in [[Philadelphia]], [[Pennsylvania]]. Founded in 1749, it is one of the oldest institutions of higher learning in the [[United States]] and a member of the Ivy League.

## History

### Colonial Era

The University of Philadelphia traces its origins to 1749, when a group of Philadelphia civic leaders established the Academy of Philadelphia. The academy was chartered in 1755 as the College of Philadelphia, becoming one of the nine colonial colleges founded before the American Revolution.

The college's early curriculum emphasized practical education alongside classical studies, reflecting the pragmatic spirit of its Philadelphia founders. This approach distinguished it from other colonial institutions and established a tradition of combining academic rigor with real-world application.

### Growth and Development

Following the Revolution, the college was reorganized as the University of Philadelphia in 1791. Throughout the 19th century, the university expanded its programs, establishing schools of law, medicine, and engineering that would become among the most respected in the nation.

The campus moved to its current location in West Philadelphia in the 1870s, where the university undertook an ambitious building program. The resulting ensemble of collegiate Gothic buildings remains the heart of the campus today.

### 20th Century

By 1950, the University of Philadelphia had established itself as one of the premier research universities in the United States, with particular strengths in medicine, business, and the sciences. Its law school and business school rank among the nation's finest.

## Campus

The main campus occupies 300 acres in West Philadelphia, featuring a mix of historic collegiate Gothic architecture and modern facilities. Notable landmarks include:

- **College Hall** — The oldest building on the current campus, completed in 1872
- **Fisher Library** — The main research library, housing over four million volumes
- **Memorial Tower** — A 200-foot bell tower honoring alumni who served in the World Wars

## Academics

The university comprises twelve schools:

- School of Arts and Sciences
- School of Engineering and Applied Science
- School of Medicine
- School of Law
- School of Business
- Graduate School of Education
- School of Nursing
- School of Architecture

## Athletics

The Philadelphia Quakers compete in the Ivy League across all sports. The university's historic Franklin Field hosts football games and has been the site of many memorable contests.

## Notable Alumni

The university has produced numerous leaders in government, business, science, and the arts, including:

- [[raymond-shepherd|Raymond Shepherd]] — Architect, designer of the [[moonlight-garden-theater|Moonlight Garden Theater]]

## See also

- [[Philadelphia]]
- [[Pennsylvania]]
- [[United States]]`,
      infobox: {
        type: 'organization',
        image: {
          url: 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktsju2l0001itzclqk00lw3.jpg',
          caption: 'University of Philadelphia campus'
        },
        fields: {
          Type: 'Private research university',
          Founded: '[[1749 k.y.]]',
          Location: '[[Philadelphia]], [[Pennsylvania]]',
          Nickname: 'Quakers',
          Affiliation: 'Ivy League'
        }
      },
      tags: ['university', 'ivy-league', 'philadelphia', 'pennsylvania', 'education']
    }
  });
  console.log('Created University of Philadelphia article:', article.id);

  // Create Organization record
  const org = await prisma.organization.create({
    data: {
      name: 'University of Philadelphia',
      orgType: 'university',
      dateFounded: new Date('1749-01-01'),
      articleId: article.id
    }
  });
  console.log('Created Organization record:', org.id);

  // Link image to article
  await prisma.image.update({
    where: { id: 'cmktsju2l0001itzclqk00lw3' },
    data: { articleId: article.id }
  });
  console.log('Linked image to article');

  // Create inspirations
  const inspirations = [
    { inspiration: 'University of Pennsylvania', wikipediaUrl: 'https://en.wikipedia.org/wiki/University_of_Pennsylvania' },
    { inspiration: 'Princeton University', wikipediaUrl: 'https://en.wikipedia.org/wiki/Princeton_University' },
    { inspiration: 'Johns Hopkins University', wikipediaUrl: 'https://en.wikipedia.org/wiki/Johns_Hopkins_University' }
  ];

  for (const insp of inspirations) {
    await prisma.inspiration.create({
      data: {
        subjectId: org.id,
        subjectType: 'organization',
        inspiration: insp.inspiration,
        wikipediaUrl: insp.wikipediaUrl
      }
    });
    console.log('Created inspiration:', insp.inspiration);
  }

  // Now update Raymond Shepherd's article
  const shepherdArticle = await prisma.article.findFirst({
    where: { title: 'Raymond Shepherd' }
  });

  if (shepherdArticle) {
    let newContent = shepherdArticle.content
      // Update University of Pennsylvania to University of Philadelphia
      .replace('University of Pennsylvania', '[[university-of-philadelphia|University of Philadelphia]]')
      // Update McKim, Mead & White to McCall, Moore & Wright
      .replace('McKim, Mead & White', 'McCall, Moore & Wright')
      // Update Orpheum Theatre to Keystone Theatre
      .replace(/Orpheum Theatre/g, 'Keystone Theatre');

    await prisma.article.update({
      where: { id: shepherdArticle.id },
      data: { content: newContent }
    });
    console.log('Updated Raymond Shepherd article with fictional names');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

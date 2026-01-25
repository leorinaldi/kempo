require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Update Brightway article with new image
  const brightway = await prisma.article.findFirst({
    where: { title: 'Brightway' }
  });

  if (brightway) {
    // Find old image
    const oldImage = await prisma.image.findFirst({
      where: { articleId: brightway.id }
    });

    const newImageId = 'cmktt23wh0001itimhkkyvtcx';

    // Link new image as replacement
    if (oldImage) {
      await prisma.image.update({
        where: { id: newImageId },
        data: {
          previousVersionId: oldImage.id,
          articleId: brightway.id
        }
      });
      await prisma.image.update({
        where: { id: oldImage.id },
        data: { articleId: null }
      });
      console.log('Linked new image as replacement for old Brightway image');
    } else {
      await prisma.image.update({
        where: { id: newImageId },
        data: { articleId: brightway.id }
      });
    }

    // Update infobox with new image
    const newInfobox = {
      ...brightway.infobox,
      image: {
        url: 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktt23wh0001itimhkkyvtcx.jpg',
        caption: 'Brightway theater district at night, 1950'
      }
    };

    await prisma.article.update({
      where: { id: brightway.id },
      data: { infobox: newInfobox }
    });
    console.log('Updated Brightway article with new image');
  }

  // 2. Get the New York Torch publication series for linking
  const torchPub = await prisma.publicationSeries.findFirst({
    where: { name: 'New York Torch' }
  });
  console.log('New York Torch publication ID:', torchPub ? torchPub.id : 'NOT FOUND');

  // 3. Create New York Torch article
  const torchArticle = await prisma.article.create({
    data: {
      title: 'New York Torch',
      type: 'organization',
      subtype: 'newspaper',
      status: 'published',
      content: `**The New York Torch** is a daily newspaper published in [[new-york-city|New York City]]. Founded in 1851, it is one of the oldest and most influential newspapers in the [[United States]], known for its comprehensive coverage of national and international news.

## History

### Founding

The New York Torch was founded in 1851 by publisher and journalist William Hartley, who envisioned a newspaper that would illuminate the truth for its readers. The paper's name reflected Hartley's belief that journalism should serve as "a torch lighting the way through the darkness of ignorance."

The paper began as a penny press aimed at working-class readers, but quickly established itself as a serious journal of record. By the 1870s, the Torch had become the newspaper of choice for New York's business and political elite.

### Growth and Influence

In 1904, the Torch moved to a new headquarters at the intersection of 42nd Street and Seventh Avenue in [[manhattan|Manhattan]]. The surrounding area soon became known as [[brightway|Torch Square]] in honor of the newspaper's iconic building and its illuminated tower.

The early 20th century saw the Torch expand its coverage and influence. The paper established foreign bureaus across Europe and Asia, and its editorial page became required reading for politicians and policymakers.

### Modern Era

By 1950, the New York Torch had established itself as the nation's "newspaper of record," known for its thorough reporting, distinguished writing, and commitment to journalistic integrity. The paper's motto, "All the News That's Fit to Print," reflects its dedication to responsible journalism.

## Headquarters

The Torch Tower, completed in 1904, remains one of the most recognizable buildings in Manhattan. The building's distinctive torch-shaped spire is illuminated at night, serving as a beacon in the heart of [[brightway|Torch Square]].

## Notable Staff

The Torch has employed many distinguished journalists, editors, and columnists throughout its history.

## See also

- [[new-york-city|New York City]]
- [[brightway|Brightway]]
- [[manhattan|Manhattan]]`,
      infobox: {
        type: 'organization',
        fields: {
          Type: 'Daily newspaper',
          Founded: '[[1851 k.y.]]',
          Headquarters: '[[brightway|Torch Square]], [[new-york-city|New York City]]',
          Motto: '"All the News That\'s Fit to Print"',
          Circulation: '500,000+ daily (1950)'
        }
      },
      tags: ['newspaper', 'new-york', 'media', 'journalism']
    }
  });
  console.log('Created New York Torch article:', torchArticle.id);

  // 4. Link publication series to article
  if (torchPub) {
    await prisma.publicationSeries.update({
      where: { id: torchPub.id },
      data: { articleId: torchArticle.id }
    });
    console.log('Linked publication series to article');
  }

  // 5. Create inspiration (New York Times)
  // First get or create an organization record
  let torchOrg = await prisma.organization.findFirst({
    where: { name: 'New York Torch' }
  });

  if (!torchOrg) {
    torchOrg = await prisma.organization.create({
      data: {
        name: 'New York Torch',
        orgType: 'newspaper',
        dateFounded: new Date('1851-01-01'),
        articleId: torchArticle.id
      }
    });
    console.log('Created Organization record:', torchOrg.id);
  }

  await prisma.inspiration.create({
    data: {
      subjectId: torchOrg.id,
      subjectType: 'organization',
      inspiration: 'The New York Times',
      wikipediaUrl: 'https://en.wikipedia.org/wiki/The_New_York_Times'
    }
  });
  console.log('Created inspiration: The New York Times');
}

main().catch(console.error).finally(() => prisma.$disconnect());

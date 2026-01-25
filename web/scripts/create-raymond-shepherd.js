require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create the article
  const article = await prisma.article.create({
    data: {
      title: 'Raymond Shepherd',
      type: 'person',
      subtype: 'architect',
      status: 'published',
      content: `**Raymond Shepherd** (1872–1948) was an American architect renowned for his theater designs. He designed over forty theaters across the United States, including the celebrated [[moonlight-garden-theater|Moonlight Garden Theater]] on [[broadway|Broadway]].

## Early life and education

Shepherd was born in Philadelphia, Pennsylvania, to a family of builders. His father operated a successful construction firm, and young Raymond grew up surrounded by blueprints and building sites. He studied architecture at the University of Pennsylvania, graduating in 1894, and spent two years in Europe studying classical and Renaissance architecture.

## Career

### Early work

After returning from Europe, Shepherd joined the New York firm of McKim, Mead & White as a draftsman. He quickly distinguished himself with his attention to ornamental detail and his ability to create intimate spaces within grand structures.

In 1905, Shepherd established his own practice, initially designing private residences and small commercial buildings. His breakthrough came in 1910 when he was commissioned to design the Orpheum Theatre in Philadelphia, which earned widespread praise for its innovative sightlines and lavish interior.

### Theater design

Shepherd became one of the most sought-after theater architects of his generation. His designs were characterized by:

- **Ornate interiors** inspired by European opera houses
- **Innovative acoustics** that ensured every seat could hear clearly
- **Romantic atmospheric designs** featuring painted ceilings and elaborate plasterwork

His masterpiece, the [[moonlight-garden-theater|Moonlight Garden Theater]] (1922), featured a ceiling painted to resemble a moonlit garden, with gilded trellises and crystal chandeliers creating an enchanted atmosphere.

### Later career

Throughout the 1920s, Shepherd designed theaters for the major theatrical producers of the era. The stock market crash of 1929 effectively ended the theater building boom, and Shepherd turned to restoration and renovation work in his later years.

## Personal life

Shepherd married Eleanor Whitfield in 1901. The couple had two children. He was known for his quiet demeanor and meticulous attention to detail, often spending hours adjusting a single ornamental feature until it met his exacting standards.

## Legacy

Shepherd's theaters remain among the most beautiful on Broadway. His emphasis on creating intimate, romantic spaces influenced a generation of theater designers.

## Selected works

- Orpheum Theatre, Philadelphia (1910)
- [[moonlight-garden-theater|Moonlight Garden Theater]], New York (1922)
- St. Michael's Theater, New York (1924)
- Curtain Call Theater, New York (1926)

## See also

- [[moonlight-garden-theater|Moonlight Garden Theater]]
- [[broadway|Broadway]]
- [[new-york-city|New York City]]`,
      infobox: {
        type: 'person',
        image: {
          url: 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktsa0o60001itpq8pqtemjo.jpg',
          caption: 'Raymond Shepherd, circa 1922'
        },
        fields: {
          Born: '[[March 15, 1872 k.y.]]',
          Died: '[[October 8, 1948 k.y.]]',
          Birthplace: 'Philadelphia, [[Pennsylvania]]',
          Occupation: 'Architect',
          'Known for': '[[moonlight-garden-theater|Moonlight Garden Theater]]',
          'Years active': '1905–1945'
        }
      },
      tags: ['architect', 'broadway', 'new-york']
    }
  });
  console.log('Created Raymond Shepherd article:', article.id);

  // Create Person record
  const person = await prisma.person.create({
    data: {
      firstName: 'Raymond',
      lastName: 'Shepherd',
      birthDate: new Date('1872-03-15'),
      deathDate: new Date('1948-10-08'),
      articleId: article.id
    }
  });
  console.log('Created Person record:', person.id);

  // Link image to article
  await prisma.image.update({
    where: { id: 'cmktsa0o60001itpq8pqtemjo' },
    data: { articleId: article.id }
  });
  console.log('Linked image to article');

  // Create ImageSubject
  await prisma.imageSubject.create({
    data: {
      imageId: 'cmktsa0o60001itpq8pqtemjo',
      itemId: person.id,
      itemType: 'person'
    }
  });
  console.log('Created ImageSubject');

  // Create inspirations
  const inspirations = [
    { inspiration: 'Herbert J. Krapp', wikipediaUrl: 'https://en.wikipedia.org/wiki/Herbert_J._Krapp' },
    { inspiration: 'Thomas W. Lamb', wikipediaUrl: 'https://en.wikipedia.org/wiki/Thomas_W._Lamb' }
  ];

  for (const insp of inspirations) {
    await prisma.inspiration.create({
      data: {
        subjectId: person.id,
        subjectType: 'person',
        inspiration: insp.inspiration,
        wikipediaUrl: insp.wikipediaUrl
      }
    });
    console.log('Created inspiration:', insp.inspiration);
  }

  // Update Moonlight Garden Theater article to use Raymond Shepherd
  const moonlightArticle = await prisma.article.findFirst({
    where: { title: 'Moonlight Garden Theater' }
  });

  if (moonlightArticle) {
    // Update content
    let newContent = moonlightArticle.content
      .replace('Thomas Bellamy', '[[raymond-shepherd|Raymond Shepherd]]')
      .replace('architect Thomas Bellamy', 'architect [[raymond-shepherd|Raymond Shepherd]]');

    // Update infobox
    const newInfobox = { ...moonlightArticle.infobox };
    if (newInfobox.fields) {
      newInfobox.fields.Architect = '[[raymond-shepherd|Raymond Shepherd]]';
    }

    await prisma.article.update({
      where: { id: moonlightArticle.id },
      data: {
        content: newContent,
        infobox: newInfobox
      }
    });
    console.log('Updated Moonlight Garden Theater with Raymond Shepherd link');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

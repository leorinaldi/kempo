require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Minnesota with image
  const mn = await prisma.article.findFirst({ where: { title: 'Minnesota' } });
  if (mn) {
    await prisma.article.update({
      where: { id: mn.id },
      data: {
        infobox: {
          type: 'place',
          image: {
            url: 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktqvnz40001it76kbdstx62.jpg',
            caption: 'Minnesota lake country'
          },
          fields: {
            Type: 'U.S. State',
            Region: 'Midwest',
            Capital: 'St. Paul',
            Country: '[[United States]]',
            Nickname: 'Land of 10,000 Lakes'
          }
        }
      }
    });
    // Link image to article
    await prisma.image.update({
      where: { id: 'cmktqvnz40001it76kbdstx62' },
      data: { articleId: mn.id }
    });
    console.log('Updated Minnesota with image');
  }

  // Update Connecticut with image
  const ct = await prisma.article.findFirst({ where: { title: 'Connecticut' } });
  if (ct) {
    await prisma.article.update({
      where: { id: ct.id },
      data: {
        infobox: {
          type: 'place',
          image: {
            url: 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktqw0yz0001it80rh3hm31m.jpg',
            caption: 'Connecticut coastal town'
          },
          fields: {
            Type: 'U.S. State',
            Region: 'New England',
            Capital: 'Hartford',
            Country: '[[United States]]',
            Nickname: 'The Constitution State'
          }
        }
      }
    });
    // Link image to article
    await prisma.image.update({
      where: { id: 'cmktqw0yz0001it80rh3hm31m' },
      data: { articleId: ct.id }
    });
    console.log('Updated Connecticut with image');
  }

  // Update Walter Hendricks with new image
  const wh = await prisma.article.findFirst({ where: { title: 'Walter Hendricks' } });
  if (wh) {
    // Find old image
    const oldImage = await prisma.image.findFirst({
      where: {
        articleId: wh.id,
        name: 'Walter Hendricks'
      }
    });

    // Get new image
    const newImage = await prisma.image.findUnique({
      where: { id: 'cmktqwdm70001it8usoztjv08' }
    });

    // Link old to new if old exists
    if (oldImage && oldImage.id !== newImage.id) {
      await prisma.image.update({
        where: { id: newImage.id },
        data: {
          previousVersionId: oldImage.id,
          articleId: wh.id
        }
      });
      // Remove article link from old image
      await prisma.image.update({
        where: { id: oldImage.id },
        data: { articleId: null }
      });
      console.log('Linked new image as replacement for old Walter Hendricks image');
    } else {
      // Just link new image to article
      await prisma.image.update({
        where: { id: 'cmktqwdm70001it8usoztjv08' },
        data: { articleId: wh.id }
      });
    }

    // Get current infobox
    const currentInfobox = wh.infobox || {};

    // Update infobox with new image
    await prisma.article.update({
      where: { id: wh.id },
      data: {
        infobox: {
          ...currentInfobox,
          image: {
            url: 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktqwdm70001it8usoztjv08.jpg',
            caption: 'Walter Hendricks'
          }
        }
      }
    });
    console.log('Updated Walter Hendricks with new image');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brightway = await prisma.article.findFirst({ where: { title: 'Brightway' } });
  const oldImageId = 'cmktt23wh0001itimhkkyvtcx';
  const newImageId = 'cmktt5sj00001itn0goqog4o0';

  // Link new image as replacement
  await prisma.image.update({
    where: { id: newImageId },
    data: {
      previousVersionId: oldImageId,
      articleId: brightway.id
    }
  });

  // Unlink old image
  await prisma.image.update({
    where: { id: oldImageId },
    data: { articleId: null }
  });

  // Update infobox
  await prisma.article.update({
    where: { id: brightway.id },
    data: {
      infobox: {
        ...brightway.infobox,
        image: {
          url: 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktt5sj00001itn0goqog4o0.jpg',
          caption: 'Brightway theater district at night, 1950'
        }
      }
    }
  });

  console.log('Updated Brightway article with Gemini image');

  // Delete old image
  await prisma.image.update({
    where: { id: newImageId },
    data: { previousVersionId: null }
  });
  await prisma.image.delete({ where: { id: oldImageId } });
  console.log('Deleted old Grok image');
}

main().catch(console.error).finally(() => prisma.$disconnect());

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oldImageId = 'cmkt3coeg0001itzouaop9qqe';
  const newImageId = 'cmktpg8980001itq2gzgjterj';
  const newImageUrl = 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktpg8980001itq2gzgjterj.jpg';
  
  const article = await prisma.article.findFirst({
    where: { title: 'National Foundation for Child Health' }
  });
  
  // Get org for ImageSubject
  const org = await prisma.organization.findFirst({
    where: { name: 'National Foundation for Child Health' }
  });
  
  // Link new image to article
  await prisma.image.update({
    where: { id: newImageId },
    data: { 
      articleId: article.id,
      kyDate: new Date('1950-01-01')
    }
  });
  console.log('Linked new image to article');
  
  // Create ImageSubject if org exists
  if (org) {
    await prisma.imageSubject.create({
      data: {
        imageId: newImageId,
        itemId: org.id,
        itemType: 'organization'
      }
    });
    console.log('Created ImageSubject');
  }
  
  // Delete old ImageSubject if exists
  await prisma.imageSubject.deleteMany({
    where: { imageId: oldImageId }
  });
  
  // Delete old image
  await prisma.image.delete({ where: { id: oldImageId } });
  console.log('Deleted old image');
  
  // Update article infobox
  const infobox = article.infobox || {};
  infobox.image = {
    url: newImageUrl,
    caption: 'National Foundation for Child Health logo'
  };
  await prisma.article.update({
    where: { id: article.id },
    data: { infobox: infobox }
  });
  console.log('Updated infobox');
  
  console.log('Done!');
}

main().then(() => prisma.$disconnect());

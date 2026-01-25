require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const imageId = 'cmktpa6380001itfy2e1dbe0y';
  const imageUrl = 'https://8too1xbunlfsupi8.public.blob.vercel-storage.com/kempo-media/image/cmktpa6380001itfy2e1dbe0y.jpg';
  
  // Get article and org
  const article = await prisma.article.findFirst({
    where: { title: 'New England University Medical School' }
  });
  const org = await prisma.organization.findFirst({
    where: { name: 'New England University Medical School' }
  });
  
  // Link image to article
  await prisma.image.update({
    where: { id: imageId },
    data: { 
      articleId: article.id,
      kyDate: new Date('1950-01-01')
    }
  });
  console.log('Linked image to article');
  
  // Create ImageSubject
  await prisma.imageSubject.create({
    data: {
      imageId: imageId,
      itemId: org.id,
      itemType: 'organization'
    }
  });
  console.log('Created ImageSubject');
  
  // Update article infobox
  const infobox = article.infobox || {};
  infobox.image = {
    url: imageUrl,
    caption: 'New England University Medical School seal'
  };
  
  await prisma.article.update({
    where: { id: article.id },
    data: { infobox: infobox }
  });
  console.log('Updated article infobox');
  
  console.log('Done!');
}

main().then(() => prisma.$disconnect());

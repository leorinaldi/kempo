require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brightway = await prisma.article.findFirst({
    where: { title: 'Brightway' }
  });

  // Check current content
  console.log('Has Torch Square:', brightway.content.includes('Torch Square'));
  console.log('Has New York Torch:', brightway.content.includes('New York Torch'));

  // Add context about Torch Square if not present
  if (brightway.content.indexOf('New York Torch') === -1) {
    let newContent = brightway.content.replace(
      '## Notable Theaters',
      `## Torch Square

The heart of Brightway is Torch Square, named after the [[new-york-torch|New York Torch]] newspaper whose headquarters has stood at the intersection of 42nd Street and Seventh Avenue since 1904. The area's famous electric signs and theater marquees make it one of the most recognizable locations in the world.

## Notable Theaters`
    );

    await prisma.article.update({
      where: { id: brightway.id },
      data: { content: newContent }
    });
    console.log('Added Torch Square section to Brightway article');
  }

  // Delete old replaced images
  const oldImages = await prisma.image.findMany({
    where: {
      name: 'Brightway Theater District',
      articleId: null
    }
  });

  for (const img of oldImages) {
    try {
      // Clear any version links first
      await prisma.image.updateMany({
        where: { previousVersionId: img.id },
        data: { previousVersionId: null }
      });
      await prisma.image.delete({ where: { id: img.id } });
      console.log('Deleted old image:', img.id);
    } catch (e) {
      console.log('Could not delete', img.id, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

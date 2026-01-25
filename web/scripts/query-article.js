const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const searchTerm = process.argv[2] || 'Steel City';

  const article = await prisma.article.findFirst({
    where: { title: { contains: searchTerm } },
    select: { id: true, title: true, infobox: true }
  });

  if (article) {
    console.log('Article:', article.title);
    console.log('Has image in infobox:', article.infobox?.image?.url ? 'YES' : 'NO');
    if (article.infobox?.image?.url) {
      console.log('Image URL:', article.infobox.image.url);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

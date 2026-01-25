import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.$queryRaw`
    SELECT id, title, content FROM articles
    WHERE title IN ('Robert Whitfield', 'Harold S. Kellman')
  `;

  for (const a of articles) {
    // Fix [[1950|1950 k.y.]] -> [[1950 k.y.]]
    const newContent = a.content.replace(/\[\[1950\|1950 k\.y\.\]\]/g, '[[1950 k.y.]]');

    if (newContent !== a.content) {
      await prisma.$executeRaw`UPDATE articles SET content = ${newContent} WHERE id = ${a.id}`;
      console.log('Fixed: ' + a.title);
    }
  }
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== FIXING EMPTY PIPE LINKS ===\n');

  const articles = await prisma.$queryRaw`
    SELECT id, title, content FROM articles
    WHERE content LIKE '%|]]%'
  `;

  let fixCount = 0;

  for (const a of articles) {
    const original = a.content;
    // Fix [[Something|]] -> [[Something]]
    const newContent = a.content.replace(/\[\[([^\]|]+)\|\]\]/g, '[[$1]]');

    if (newContent !== original) {
      await prisma.$executeRaw`UPDATE articles SET content = ${newContent} WHERE id = ${a.id}`;
      const matches = original.match(/\[\[[^\]|]+\|\]\]/g) || [];
      console.log(`Fixed ${a.title}: ${matches.length} links`);
      fixCount++;
    }
  }

  console.log(`\nFixed ${fixCount} articles`);
}

main().finally(() => prisma.$disconnect());

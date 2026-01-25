import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== FIXING PIPED LINKS ===\n');

  // Use raw SQL to avoid schema mismatch issues
  const articles = await prisma.$queryRaw`SELECT id, title, content FROM articles`;

  let fixCount = 0;

  for (const article of articles) {
    const original = article.content;
    let content = article.content;

    // [[slug|display]] -> display (for non-existent pages)
    // Teams
    content = content.replace(/\[\[new-york-empires\|([^\]]+)\]\]/gi, '$1');
    content = content.replace(/\[\[cleveland-scouts\|([^\]]+)\]\]/gi, '$1');
    content = content.replace(/\[\[steel-city-bandits\|([^\]]+)\]\]/gi, '$1');

    // People (that dont exist)
    content = content.replace(/\[\[henry-durant\|([^\]]+)\]\]/gi, '$1');
    content = content.replace(/\[\[randolph-mercer\|([^\]]+)\]\]/gi, '$1');

    // World War II#morale -> World War II (keep display text)
    content = content.replace(/\[\[World War II#morale\|([^\]]+)\]\]/gi, '[[World War II|$1]]');

    // 1948-election -> keep display text as plain
    content = content.replace(/\[\[1948-election\|([^\]]+)\]\]/gi, '$1');

    // Fix remaining broken links (with pipe format)
    content = content.replace(/\[\[1927-03-ky\|[^\]]+\]\]/g, 'March 1927');
    content = content.replace(/\[\[1928-12-ky\|[^\]]+\]\]/g, 'December 1928');
    content = content.replace(/\[\[1890s\|[^\]]+\]\]/g, '1891');
    content = content.replace(/\[\[1950\]\]/g, '[[1950 k.y.]]');

    // Fix double-bracket issue
    content = content.replace(/\[\[\[\[/g, '[[');

    if (content !== original) {
      await prisma.$executeRaw`UPDATE articles SET content = ${content} WHERE id = ${article.id}`;
      console.log('Fixed: ' + article.title);
      fixCount++;
    }
  }

  console.log('\nFixed ' + fixCount + ' articles');
}

main().finally(() => prisma.$disconnect());

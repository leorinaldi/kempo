import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.$queryRaw`
    SELECT id, title, content FROM articles
    WHERE title IN ('Robert Whitfield', 'Harold S. Kellman')
  `;

  for (const a of articles) {
    console.log('\n=== ' + a.title + ' ===');
    // Find all occurrences of [[1950 in the content
    const matches = [];
    let pos = 0;
    while (true) {
      const idx = a.content.indexOf('[[1950', pos);
      if (idx === -1) break;
      // Extract the full link
      const endIdx = a.content.indexOf(']]', idx);
      if (endIdx === -1) break;
      const link = a.content.substring(idx, endIdx + 2);
      matches.push({ pos: idx, link });
      pos = endIdx + 2;
    }

    if (matches.length === 0) {
      console.log('No [[1950... links found');
    } else {
      matches.forEach(m => {
        console.log('Position ' + m.pos + ': ' + m.link);
        // Show context
        const start = Math.max(0, m.pos - 30);
        const end = Math.min(a.content.length, m.pos + m.link.length + 30);
        console.log('Context: ...' + a.content.substring(start, end) + '...');
      });
    }
  }
}

main().finally(() => prisma.$disconnect());

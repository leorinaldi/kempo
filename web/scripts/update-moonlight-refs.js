require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Jerome Goodwin to mention Moonlight Garden
  const goodwin = await prisma.article.findFirst({ where: { title: 'Jerome Goodwin' } });
  if (goodwin && goodwin.content.indexOf('moonlight-garden') === -1) {
    const updatedContent = goodwin.content.replace(
      'Their collaboration has produced some of the most beloved musicals',
      'Their collaboration, often premiering at the [[moonlight-garden-theater|Moonlight Garden Theater]], has produced some of the most beloved musicals'
    );
    if (updatedContent !== goodwin.content) {
      await prisma.article.update({
        where: { id: goodwin.id },
        data: { content: updatedContent }
      });
      console.log('Updated Jerome Goodwin article');
    } else {
      console.log('Jerome Goodwin - pattern not found');
    }
  }

  // Update Howard Langford to mention Moonlight Garden
  const langford = await prisma.article.findFirst({ where: { title: 'Howard Langford' } });
  if (langford && langford.content.indexOf('moonlight-garden') === -1) {
    const updatedContent = langford.content.replace(
      'Their collaboration has produced some of the most beloved musicals',
      'Their collaboration, often premiering at the [[moonlight-garden-theater|Moonlight Garden Theater]], has produced some of the most beloved musicals'
    );
    if (updatedContent !== langford.content) {
      await prisma.article.update({
        where: { id: langford.id },
        data: { content: updatedContent }
      });
      console.log('Updated Howard Langford article');
    } else {
      console.log('Howard Langford - pattern not found');
    }
  }

  // Mark Broadway as quality checked
  await prisma.article.updateMany({
    where: { title: 'Broadway' },
    data: { qualityCheckedAt: new Date('2026-01-25') }
  });
  console.log('Marked Broadway as quality checked');
}

main().catch(console.error).finally(() => prisma.$disconnect());

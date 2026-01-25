require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Jerome Goodwin - add reference after Oklahoma Wind mention
  const goodwin = await prisma.article.findFirst({ where: { title: 'Jerome Goodwin' } });
  if (goodwin && goodwin.content.indexOf('moonlight-garden') === -1) {
    // Try to add after mentioning their hit shows
    let updatedContent = goodwin.content;

    // Add to See also if it exists
    if (updatedContent.includes('## See also')) {
      updatedContent = updatedContent.replace(
        '## See also',
        '## See also\n\n- [[moonlight-garden-theater|Moonlight Garden Theater]]'
      );
    }

    await prisma.article.update({
      where: { id: goodwin.id },
      data: { content: updatedContent }
    });
    console.log('Updated Jerome Goodwin article with Moonlight Garden in See also');
  }

  // Update Howard Langford similarly
  const langford = await prisma.article.findFirst({ where: { title: 'Howard Langford' } });
  if (langford && langford.content.indexOf('moonlight-garden') === -1) {
    let updatedContent = langford.content;

    if (updatedContent.includes('## See also')) {
      updatedContent = updatedContent.replace(
        '## See also',
        '## See also\n\n- [[moonlight-garden-theater|Moonlight Garden Theater]]'
      );
    }

    await prisma.article.update({
      where: { id: langford.id },
      data: { content: updatedContent }
    });
    console.log('Updated Howard Langford article with Moonlight Garden in See also');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

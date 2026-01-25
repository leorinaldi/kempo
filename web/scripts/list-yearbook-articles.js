require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    where: {
      status: 'published'
    },
    select: {
      id: true,
      title: true,
      type: true,
      subtype: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Filter to articles created in 2026 (our yearbook work)
  const recentArticles = articles.filter(a =>
    new Date(a.createdAt).getFullYear() === 2026
  );

  console.log('Articles created in 2026 (yearbook work):');
  console.log('==========================================');
  for (const a of recentArticles) {
    const subtype = a.subtype || 'none';
    const date = new Date(a.createdAt).toISOString().split('T')[0];
    // Create slug from title
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    console.log(a.title + ' | ' + slug + ' | ' + a.type + '/' + subtype + ' | ' + date);
  }
  console.log('\nTotal: ' + recentArticles.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());

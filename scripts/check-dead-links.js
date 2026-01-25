#!/usr/bin/env node

/**
 * Check Dead Links in Kempopedia Articles
 *
 * Scans all articles for wikilinks and reports which ones point to non-existent articles.
 *
 * Usage:
 *   node scripts/check-dead-links.js           # Full report
 *   node scripts/check-dead-links.js --summary # Summary only
 *   node scripts/check-dead-links.js --json    # JSON output
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extract all wikilinks from content
function extractWikilinks(content) {
  const links = [];
  // Match [[slug]] or [[slug|display text]]
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const slug = match[1].trim();
    // Skip date links (contain "k.y.")
    if (slug.includes('k.y.')) continue;
    // Skip external-looking links
    if (slug.startsWith('http')) continue;
    links.push(slug);
  }
  return [...new Set(links)]; // Dedupe
}

// Normalize slug for comparison
function normalizeSlug(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  const summaryOnly = args.includes('--summary');
  const jsonOutput = args.includes('--json');

  console.log('Scanning Kempopedia articles for dead links...\n');

  // Get all articles
  const articles = await prisma.article.findMany({
    select: { id: true, title: true, content: true }
  });

  console.log(`Found ${articles.length} articles to scan.\n`);

  // Build a set of all existing article titles (normalized)
  const existingTitles = new Set();
  const titleMap = new Map(); // normalized -> actual title

  for (const article of articles) {
    const normalized = normalizeSlug(article.title);
    existingTitles.add(normalized);
    titleMap.set(normalized, article.title);
  }

  // Track dead links
  const deadLinks = []; // { article, link, normalizedLink }
  const deadLinkCounts = new Map(); // link -> count
  const articlesWithDeadLinks = new Map(); // articleTitle -> [links]

  // Scan each article
  for (const article of articles) {
    const links = extractWikilinks(article.content);
    const brokenInThisArticle = [];

    for (const link of links) {
      const normalized = normalizeSlug(link);

      if (!existingTitles.has(normalized)) {
        deadLinks.push({
          article: article.title,
          link: link,
          normalizedLink: normalized
        });
        brokenInThisArticle.push(link);

        // Count occurrences
        const count = deadLinkCounts.get(link) || 0;
        deadLinkCounts.set(link, count + 1);
      }
    }

    if (brokenInThisArticle.length > 0) {
      articlesWithDeadLinks.set(article.title, brokenInThisArticle);
    }
  }

  // Sort dead links by frequency
  const sortedByFrequency = [...deadLinkCounts.entries()]
    .sort((a, b) => b[1] - a[1]);

  // Output results
  if (jsonOutput) {
    const output = {
      totalArticles: articles.length,
      articlesWithDeadLinks: articlesWithDeadLinks.size,
      totalDeadLinks: deadLinks.length,
      uniqueDeadLinks: deadLinkCounts.size,
      byFrequency: sortedByFrequency.map(([link, count]) => ({ link, count })),
      byArticle: Object.fromEntries(articlesWithDeadLinks)
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log('='.repeat(60));
    console.log('DEAD LINK REPORT');
    console.log('='.repeat(60));
    console.log(`Total articles scanned: ${articles.length}`);
    console.log(`Articles with dead links: ${articlesWithDeadLinks.size}`);
    console.log(`Total dead link instances: ${deadLinks.length}`);
    console.log(`Unique dead links: ${deadLinkCounts.size}`);
    console.log('');

    if (!summaryOnly) {
      console.log('-'.repeat(60));
      console.log('DEAD LINKS BY FREQUENCY (most common first)');
      console.log('-'.repeat(60));

      for (const [link, count] of sortedByFrequency) {
        console.log(`  [${count}x] ${link}`);
      }
      console.log('');

      console.log('-'.repeat(60));
      console.log('DEAD LINKS BY ARTICLE');
      console.log('-'.repeat(60));

      const sortedArticles = [...articlesWithDeadLinks.entries()]
        .sort((a, b) => b[1].length - a[1].length);

      for (const [articleTitle, links] of sortedArticles) {
        console.log(`\n${articleTitle} (${links.length} dead links):`);
        for (const link of links) {
          console.log(`  - [[${link}]]`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('To fix: Either create the missing articles or remove the links.');
    console.log('='.repeat(60));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

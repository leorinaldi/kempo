/**
 * Event Population Script
 *
 * Reads the event inventory JSON and creates Event records
 * with proper parent linking and person/location associations.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

interface ExtractedEvent {
  source: 'timelineEvent' | 'infobox' | 'dates';
  date: string;
  headline: string;
  description?: string;
  suggestedType?: string;
  suggestedSignificance?: number;
}

interface ArticleEvents {
  articleId: string;
  articleTitle: string;
  articleType: string;
  tags: string[];
  events: ExtractedEvent[];
  potentialParents: string[];
}

interface Inventory {
  summary: { totalArticles: number; articlesWithEvents: number; totalEvents: number };
  themes: Record<string, string[]>;
  inventory: ArticleEvents[];
}

// Parent event mappings
const PARENT_MAPPING: Record<string, string> = {
  'World War II': 'World War II',
  'Golden Age of Hollyvale': 'Golden Age of Hollyvale',
  'The Antelope Springs Incident': 'The Antelope Springs Incident',
  'Cold War': 'Cold War',
  'Organized Crime': 'Organized Crime in America',
};

// Event type refinements for specific headlines
function refineEventType(headline: string, description: string | undefined, suggestedType: string): string {
  const h = headline.toLowerCase();
  const d = (description || '').toLowerCase();

  // More specific type detection
  if (h.includes('sound barrier') || h.includes('supersonic')) return 'milestone';
  if (h.includes('testifies') || h.includes('testimony')) return 'milestone';
  if (h.includes('d-day') || h.includes('normandy')) return 'battle';
  if (h.includes('surrenders') || h.includes('surrender')) return 'treaty';
  if (h.includes('atomic') || h.includes('hiroshima') || h.includes('nagasaki')) return 'battle';
  if (h.includes('crash') && h.includes('killed')) return 'death';
  if (h.includes('marries') || h.includes('marry')) return 'marriage';

  return suggestedType;
}

// Parse k.y. date strings to JavaScript Date
function parseKyDate(dateStr: string): Date | null {
  // Handle formats like:
  // "March 14, 1949 k.y."
  // "October 4, 1946 k.y."
  // "1940 k.y."
  // "June 1942 k.y."

  // Remove "k.y." suffix
  const cleaned = dateStr.replace(/\s*k\.y\.?$/i, '').trim();

  // Full date: "Month DD, YYYY"
  const fullMatch = cleaned.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (fullMatch) {
    const [, month, day, year] = fullMatch;
    const d = new Date(`${month} ${day}, ${year}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Month Year: "June 1942"
  const monthYearMatch = cleaned.match(/^(\w+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch;
    const d = new Date(`${month} 1, ${year}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Year only: "1940"
  const yearMatch = cleaned.match(/^(\d{4})$/);
  if (yearMatch) {
    return new Date(`January 1, ${yearMatch[1]}`);
  }

  console.warn('Could not parse date:', dateStr);
  return null;
}

// Determine which theater for WW2 events
function getWw2Theater(headline: string, description: string | undefined): string | null {
  const text = `${headline} ${description || ''}`.toLowerCase();

  const pacificKeywords = ['pacific', 'japan', 'philippines', 'leyte', 'hiroshima', 'nagasaki', 'b-29'];
  const europeanKeywords = ['europe', 'france', 'normandy', 'd-day', 'germany', 'western front', 'eastern front'];

  if (pacificKeywords.some((k) => text.includes(k))) {
    return 'Pacific Theater of World War II';
  }
  if (europeanKeywords.some((k) => text.includes(k))) {
    return 'European Theater of World War II';
  }

  return null;
}

async function main() {
  console.log('Loading inventory...');
  const inventoryJson = await fs.readFile('/Users/leonardorinaldi/Claude/Kempo/docs/event-inventory.json', 'utf-8');
  const inventory: Inventory = JSON.parse(inventoryJson);

  console.log(`Found ${inventory.summary.totalEvents} events to process\n`);

  // Cache parent events
  const parentCache: Record<string, string> = {};
  const allParents = await prisma.event.findMany({ where: { parentId: null } });
  allParents.forEach((p) => {
    parentCache[p.title] = p.id;
  });

  // Also cache sub-theaters
  const subParents = await prisma.event.findMany({
    where: { parentId: { not: null } },
  });
  subParents.forEach((p) => {
    parentCache[p.title] = p.id;
  });

  console.log('Parent events available:', Object.keys(parentCache).join(', '));
  console.log('');

  // Cache people for linking
  const people = await prisma.person.findMany({
    select: { id: true, articleId: true },
  });
  const personByArticle: Record<string, string> = {};
  people.forEach((p) => {
    if (p.articleId) personByArticle[p.articleId] = p.id;
  });

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of inventory.inventory) {
    if (article.events.length === 0) continue;

    console.log(`Processing: ${article.articleTitle} (${article.events.length} events)`);

    // Determine parent based on themes
    let primaryParent: string | null = null;
    for (const theme of article.potentialParents) {
      const mappedParent = PARENT_MAPPING[theme];
      if (mappedParent && parentCache[mappedParent]) {
        primaryParent = mappedParent;
        break;
      }
    }

    for (const event of article.events) {
      const date = parseKyDate(event.date);
      if (!date) {
        console.log(`  - Skipped (invalid date): ${event.headline}`);
        skipped++;
        continue;
      }

      // Check if event already exists
      const existing = await prisma.event.findFirst({
        where: {
          title: event.headline,
          kyDateBegin: date,
        },
      });

      if (existing) {
        console.log(`  - Already exists: ${event.headline}`);
        skipped++;
        continue;
      }

      // Determine parent
      let parentId: string | null = null;

      // For WW2 events, try to assign to specific theater
      if (primaryParent === 'World War II') {
        const theater = getWw2Theater(event.headline, event.description);
        if (theater && parentCache[theater]) {
          parentId = parentCache[theater];
        } else {
          parentId = parentCache['World War II'];
        }
      } else if (primaryParent && parentCache[primaryParent]) {
        parentId = parentCache[primaryParent];
      }

      const eventType = refineEventType(event.headline, event.description, event.suggestedType || 'milestone');

      try {
        const newEvent = await prisma.event.create({
          data: {
            title: event.headline,
            description: event.description || null,
            kyDateBegin: date,
            eventType,
            significance: event.suggestedSignificance || 5,
            parentId,
          },
        });

        console.log(`  + Created: ${event.headline} (${eventType})`);
        created++;

        // Link to person if this is a person article
        if (article.articleType === 'person' && personByArticle[article.articleId]) {
          const personId = personByArticle[article.articleId];

          // Determine role based on event type
          let role = 'subject';
          if (eventType === 'birth') role = 'born';
          if (eventType === 'death') role = 'deceased';
          if (eventType === 'marriage') role = 'married';

          await prisma.eventPerson.create({
            data: {
              eventId: newEvent.id,
              personId,
              role,
            },
          });
          console.log(`    → Linked to person: ${article.articleTitle}`);
        }

        // Link to article as media
        await prisma.eventMedia.create({
          data: {
            eventId: newEvent.id,
            mediaType: 'article',
            mediaId: article.articleId,
            relationType: 'mentioned_in',
          },
        });
      } catch (error) {
        console.error(`  ! Error creating event: ${event.headline}`, error);
        errors++;
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

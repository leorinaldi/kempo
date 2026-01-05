/**
 * Reclassify unclassified events to proper parent categories
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get parent IDs (including those without children yet)
  const parents = await prisma.event.findMany({
    where: {
      OR: [
        { children: { some: {} } },
        { title: 'Cold War' },
        { title: 'Kellman Presidency' },
      ],
    },
    select: { id: true, title: true },
  });

  const parentMap: Record<string, string> = {};
  parents.forEach((p) => {
    parentMap[p.title] = p.id;
  });

  console.log('Parent categories:', Object.keys(parentMap).join(', '));

  // Define reclassifications
  const reclassifications: { pattern: string; parent: string; exact?: boolean }[] = [
    // Antelope Springs related
    { pattern: 'Collier begins Antelope Springs', parent: 'The Antelope Springs Incident' },
    { pattern: "What Fell at Antelope Springs", parent: 'The Antelope Springs Incident' },

    // Cold War / China related
    { pattern: 'Chen Zhaoming born', parent: 'Cold War', exact: true },
    { pattern: 'Chen helps found Chinese', parent: 'Cold War' },
    { pattern: 'Chinese People', parent: 'Cold War' },
    { pattern: 'The Great Retreat', parent: 'Cold War' },
    { pattern: 'CPP takes power', parent: 'Cold War', exact: true },
    { pattern: 'People\'s Republic of China', parent: 'Cold War' },

    // Hollyvale births
    { pattern: 'William Garrett born', parent: 'Golden Age of Hollyvale', exact: true },
    { pattern: 'James Thornton born', parent: 'Golden Age of Hollyvale', exact: true },
    { pattern: 'Vivian Sterling born', parent: 'Golden Age of Hollyvale', exact: true },
    { pattern: 'Robert Langley born', parent: 'Golden Age of Hollyvale', exact: true },
  ];

  let updated = 0;

  for (const rule of reclassifications) {
    const parentId = parentMap[rule.parent];
    if (!parentId) {
      console.log('Parent not found:', rule.parent);
      continue;
    }

    // Find matching events
    const events = await prisma.event.findMany({
      where: {
        parentId: null,
        title: rule.exact ? rule.pattern : { contains: rule.pattern },
      },
      select: { id: true, title: true },
    });

    for (const event of events) {
      await prisma.event.update({
        where: { id: event.id },
        data: { parentId },
      });
      console.log('Moved:', event.title, '→', rule.parent);
      updated++;
    }
  }

  console.log('\n=== Summary ===');
  console.log('Updated:', updated, 'events');

  // Show new counts
  console.log('\nUpdated parent counts:');
  for (const [title, id] of Object.entries(parentMap)) {
    const count = await prisma.event.count({ where: { parentId: id } });
    console.log(' ', title + ':', count);
  }

  // Show remaining unclassified count
  const unclassified = await prisma.event.count({
    where: { parentId: null, children: { none: {} } },
  });
  console.log('  Unclassified:', unclassified);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

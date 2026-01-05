/**
 * Clean up event parent assignments
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get parent IDs
  const ww2 = await prisma.event.findFirst({ where: { title: 'World War II' } });
  const european = await prisma.event.findFirst({ where: { title: 'European Theater of World War II' } });
  const pacific = await prisma.event.findFirst({ where: { title: 'Pacific Theater of World War II' } });
  const asi = await prisma.event.findFirst({ where: { title: 'The Antelope Springs Incident' } });

  if (!ww2 || !european || !pacific || !asi) {
    throw new Error('Parents not found');
  }

  // Fix: Colvin's Army career is not ASI-related
  const colvinCareer = ['Colvin joins Army', 'Colvin transfers to intelligence'];
  for (const title of colvinCareer) {
    const e = await prisma.event.findFirst({ where: { title } });
    if (e && e.parentId === asi.id) {
      await prisma.event.update({ where: { id: e.id }, data: { parentId: ww2.id } });
      console.log('Moved to WW2:', title);
    }
  }

  // Fix: Caldwell's death should be under ASI
  const caldwellDeath = await prisma.event.findFirst({ where: { title: 'Caldwell killed in crash' } });
  if (caldwellDeath && caldwellDeath.parentId !== asi.id) {
    await prisma.event.update({ where: { id: caldwellDeath.id }, data: { parentId: asi.id } });
    console.log('Moved to ASI: Caldwell killed in crash');
  }

  // Move clear WW2 battle/combat events to European Theater
  const europeanEvents = [
    'D-Day',
    'Caldwell awarded DFC',
    'War ends in Europe',
    'Garrison shot down',
    'Garrison becomes ace',
    'Westbrook deploys to France',
    'Westbrook commands Operation Torch',
  ];
  for (const title of europeanEvents) {
    const e = await prisma.event.findFirst({ where: { title } });
    if (e && e.parentId === ww2.id) {
      await prisma.event.update({ where: { id: e.id }, data: { parentId: european.id } });
      console.log('Moved to European Theater:', title);
    }
  }

  // Move clear Pacific events
  const pacificEvents = [
    'Westbrook named Supreme Commander Pacific',
    "'I have returned'",
    'Japan surrenders',
    'Whitmore commands bomber wing',
  ];
  for (const title of pacificEvents) {
    const e = await prisma.event.findFirst({ where: { title } });
    if (e && e.parentId === ww2.id) {
      await prisma.event.update({ where: { id: e.id }, data: { parentId: pacific.id } });
      console.log('Moved to Pacific Theater:', title);
    }
  }

  // Remove parent from pre-WW2 events (like WWI, 1920s career)
  const unparentKeywords = ['WWI', 'county judge', 'test pilot', 'Army Academy', 'enlisted', 'sound barrier'];
  for (const keyword of unparentKeywords) {
    const events = await prisma.event.findMany({
      where: {
        parentId: { in: [ww2.id, european.id, pacific.id] },
        title: { contains: keyword },
      },
    });
    for (const e of events) {
      await prisma.event.update({ where: { id: e.id }, data: { parentId: null } });
      console.log('Unparented:', e.title);
    }
  }

  // Also unparent events explicitly marked as general milestones
  const generalEvents = [
    'Garrison enlists',
    'Garrison commissioned',
    'Garrison becomes test pilot',
    'Sound barrier broken',
    'Caldwell commissioned',
    'Caldwell becomes test pilot',
    'Caldwell flies chase for sound barrier attempt',
    'Whitmore joins Army',
    'Whitmore serves in WWI',
    'Whitmore promoted to brigadier general',
    'Kellman joins Army for WWI',
    'Kellman returns from WWI',
    'Kellman nominated for Vice President',
    'Kellman becomes President',
    'War ends',
    'Armistice ends WWI',
  ];
  for (const title of generalEvents) {
    const e = await prisma.event.findFirst({ where: { title } });
    if (e && e.parentId) {
      // Check if it's under WW2 hierarchy
      const parent = await prisma.event.findUnique({ where: { id: e.parentId } });
      const isWw2 = parent?.title.includes('World War') || parent?.parentId === ww2.id;
      if (isWw2) {
        await prisma.event.update({ where: { id: e.id }, data: { parentId: null } });
        console.log('Unparented (general):', title);
      }
    }
  }

  // Count final state
  const ww2Count = await prisma.event.count({ where: { parentId: ww2.id } });
  const euroCount = await prisma.event.count({ where: { parentId: european.id } });
  const pacCount = await prisma.event.count({ where: { parentId: pacific.id } });
  const asiCount = await prisma.event.count({ where: { parentId: asi.id } });
  const hollywood = await prisma.event.findFirst({ where: { title: 'Golden Age of Hollyvale' } });
  const hwCount = hollywood ? await prisma.event.count({ where: { parentId: hollywood.id } }) : 0;

  console.log('\nFinal parent counts:');
  console.log('  WW2 (direct):', ww2Count);
  console.log('  European Theater:', euroCount);
  console.log('  Pacific Theater:', pacCount);
  console.log('  Antelope Springs:', asiCount);
  console.log('  Hollyvale:', hwCount);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

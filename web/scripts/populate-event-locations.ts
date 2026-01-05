/**
 * Populate EventLocation links based on event descriptions and titles
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LocationMatch {
  locationType: 'nation' | 'state' | 'city' | 'place';
  locationId: string;
  name: string;
}

async function main() {
  // Load all locations into memory for matching
  const nations = await prisma.nation.findMany({ select: { id: true, name: true } });
  const states = await prisma.state.findMany({ select: { id: true, name: true } });
  const cities = await prisma.city.findMany({ select: { id: true, name: true } });
  const places = await prisma.place.findMany({ select: { id: true, name: true } });

  // Build location lookup
  const locationPatterns: { pattern: RegExp; match: LocationMatch }[] = [];

  // Add nations
  for (const n of nations) {
    locationPatterns.push({
      pattern: new RegExp(`\\b${n.name}\\b`, 'i'),
      match: { locationType: 'nation', locationId: n.id, name: n.name },
    });
  }

  // Add states
  for (const s of states) {
    locationPatterns.push({
      pattern: new RegExp(`\\b${s.name}\\b`, 'i'),
      match: { locationType: 'state', locationId: s.id, name: s.name },
    });
  }

  // Add cities
  for (const c of cities) {
    locationPatterns.push({
      pattern: new RegExp(`\\b${c.name}\\b`, 'i'),
      match: { locationType: 'city', locationId: c.id, name: c.name },
    });
  }

  // Add places
  for (const p of places) {
    locationPatterns.push({
      pattern: new RegExp(`\\b${p.name}\\b`, 'i'),
      match: { locationType: 'place', locationId: p.id, name: p.name },
    });
  }

  // Additional keyword mappings for events that don't mention exact names
  const keywordMappings: { keywords: string[]; locationType: string; locationName: string }[] = [
    { keywords: ['D-Day', 'Normandy', 'Operation Overlord'], locationType: 'nation', locationName: 'France' },
    { keywords: ['Pacific Theater', 'Pacific'], locationType: 'nation', locationName: 'Japan' },
    { keywords: ['European Theater', 'Western Front'], locationType: 'nation', locationName: 'France' },
    { keywords: ['Antelope Springs', 'Stokes', 'debris'], locationType: 'city', locationName: 'Antelope Springs' },
    { keywords: ['Ridgecrest'], locationType: 'place', locationName: 'Ridgecrest Air Force Base' },
    { keywords: ['Hollyvale', 'Pacific Pictures', 'film industry'], locationType: 'city', locationName: 'Los Angeles' },
    { keywords: ['Leyte', 'Philippines', 'I have returned'], locationType: 'nation', locationName: 'Philippines' },
  ];

  // Load all events
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  let created = 0;
  let skipped = 0;

  for (const event of events) {
    const text = `${event.title} ${event.description || ''}`;
    const matchedLocations: LocationMatch[] = [];

    // Check direct patterns
    for (const { pattern, match } of locationPatterns) {
      if (pattern.test(text)) {
        // Avoid duplicates
        if (!matchedLocations.find((m) => m.locationId === match.locationId)) {
          matchedLocations.push(match);
        }
      }
    }

    // Check keyword mappings
    for (const mapping of keywordMappings) {
      if (mapping.keywords.some((k) => text.toLowerCase().includes(k.toLowerCase()))) {
        // Find the location
        const loc = locationPatterns.find(
          (lp) => lp.match.name === mapping.locationName && lp.match.locationType === mapping.locationType
        );
        if (loc && !matchedLocations.find((m) => m.locationId === loc.match.locationId)) {
          matchedLocations.push(loc.match);
        }
      }
    }

    // Create links
    for (const match of matchedLocations) {
      // Check if already exists
      const existing = await prisma.eventLocation.findFirst({
        where: {
          eventId: event.id,
          locationId: match.locationId,
          locationType: match.locationType,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Determine role based on event type
      let role = 'occurred_at';
      if (event.title.toLowerCase().includes('born')) {
        role = 'birthplace';
      } else if (event.title.toLowerCase().includes('dies') || event.title.toLowerCase().includes('died')) {
        role = 'deathplace';
      }

      await prisma.eventLocation.create({
        data: {
          eventId: event.id,
          locationType: match.locationType,
          locationId: match.locationId,
          role,
        },
      });

      console.log(`Linked: "${event.title}" → ${match.name} (${match.locationType})`);
      created++;
    }
  }

  console.log('\n=== Summary ===');
  console.log('Created:', created);
  console.log('Skipped (already exists):', skipped);

  const totalLinks = await prisma.eventLocation.count();
  console.log('Total location links:', totalLinks);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

/**
 * Populate events for Organized Crime in America
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the parent event
  const orgCrime = await prisma.event.findFirst({
    where: { title: 'Organized Crime in America' },
  });

  if (!orgCrime) {
    console.log('Parent not found!');
    return;
  }

  console.log('Parent ID:', orgCrime.id);

  // Get person records for linking
  const people = await prisma.person.findMany({
    where: {
      article: {
        tags: { has: 'organized-crime' },
      },
    },
    include: { article: { select: { title: true, infobox: true } } },
  });

  console.log('\nFound', people.length, 'organized crime people:');
  people.forEach((p) => {
    const name = p.firstName + ' ' + p.lastName;
    console.log('  -', name, '| ID:', p.id);
  });

  // Define events to create
  const events = [
    // Key figures' births
    {
      title: 'Salvatore Conti born',
      date: '1894-03-15',
      type: 'birth',
      sig: 4,
      desc: 'Future crime boss born in Lauria, Calabria, Italy.',
    },
    {
      title: 'Enzo Ferrante born',
      date: '1897-11-21',
      type: 'birth',
      sig: 3,
      desc: 'Future underboss born in Naples, Italy.',
    },
    {
      title: 'Sidney Hartman born',
      date: '1899-12-25',
      type: 'birth',
      sig: 3,
      desc: 'Future Las Vegas casino operator born in Cleveland, Ohio.',
    },
    {
      title: 'Sol Roth born',
      date: '1902-07-04',
      type: 'birth',
      sig: 4,
      desc: 'Future syndicate financial mastermind born in Grodno, Russian Empire.',
    },
    {
      title: 'Carmine DeMarco born',
      date: '1908-09-10',
      type: 'birth',
      sig: 3,
      desc: 'Future Tammany Hall political fixer born in Manhattan.',
    },
    {
      title: 'Paulie Caruso born',
      date: '1910-02-03',
      type: 'birth',
      sig: 2,
      desc: 'Future bodyguard to Salvatore Conti born in Manhattan.',
    },
    {
      title: 'Jack Callahan born',
      date: '1913-02-14',
      type: 'birth',
      sig: 3,
      desc: 'Future corrupt labor leader born in Motor City.',
    },
    {
      title: 'Savannah Fontaine born',
      date: '1916-08-26',
      type: 'birth',
      sig: 3,
      desc: 'Future "Queen of the Underworld" born in Lipscomb, Alabama.',
    },

    // Key syndicate events
    {
      title: 'National Crime Syndicate established',
      date: '1931-01-01',
      type: 'founding',
      sig: 8,
      desc: 'Major crime families form cooperative organization following the Castellammarese War.',
    },
    {
      title: 'Conti becomes syndicate boss',
      date: '1936-01-01',
      type: 'appointment',
      sig: 7,
      desc: 'Salvatore Conti rises to lead the New York operations of the national syndicate.',
    },
    {
      title: 'Sol Roth begins Las Vegas investments',
      date: '1945-01-01',
      type: 'milestone',
      sig: 6,
      desc: 'Roth identifies Las Vegas as prime territory for syndicate gambling operations.',
    },
    {
      title: 'DeMarco becomes Tammany Hall leader',
      date: '1946-01-01',
      type: 'appointment',
      sig: 5,
      desc: 'Carmine DeMarco rises to control patronage and judicial appointments in New York City.',
    },
    {
      title: 'Lucky Sands Casino opens',
      date: '1947-06-01',
      type: 'founding',
      sig: 6,
      desc: 'Sidney Hartman opens the Lucky Sands on the Las Vegas Strip, backed by Eastern syndicate money.',
    },
    {
      title: 'Callahan takes control of Central States pension fund',
      date: '1948-01-01',
      type: 'appointment',
      sig: 6,
      desc: 'Jack Callahan gains control of one of the largest pension funds in America.',
    },
  ];

  let created = 0;
  for (const e of events) {
    // Check if exists
    const existing = await prisma.event.findFirst({
      where: { title: e.title },
    });
    if (existing) {
      console.log('\nAlready exists:', e.title);
      continue;
    }

    const newEvent = await prisma.event.create({
      data: {
        title: e.title,
        description: e.desc,
        kyDateBegin: new Date(e.date),
        eventType: e.type,
        significance: e.sig,
        parentId: orgCrime.id,
      },
    });
    console.log('\nCreated:', e.title);
    created++;

    // Link to person if it's a birth event
    if (e.type === 'birth') {
      const lastName = e.title.replace(' born', '').split(' ').pop();
      const person = people.find((p) => p.lastName === lastName);
      if (person) {
        await prisma.eventPerson.create({
          data: { eventId: newEvent.id, personId: person.id, role: 'born' },
        });
        console.log('  → Linked to person:', person.firstName, person.lastName);
      }
    }

    // Link key figures to their appointment/milestone events (skip if already linked via birth)
    if (e.type !== 'birth') {
      if (e.title.includes('Conti')) {
        const conti = people.find((p) => p.lastName === 'Conti');
        if (conti) {
          await prisma.eventPerson.create({
            data: { eventId: newEvent.id, personId: conti.id, role: 'subject' },
          });
          console.log('  → Linked to Conti');
        }
      }
      if (e.title.includes('Sol Roth') || e.title.includes('Roth')) {
        const roth = people.find((p) => p.lastName === 'Roth');
        if (roth) {
          await prisma.eventPerson.create({
            data: { eventId: newEvent.id, personId: roth.id, role: 'subject' },
          });
          console.log('  → Linked to Roth');
        }
      }
      if (e.title.includes('Lucky Sands') || e.title.includes('Hartman')) {
        const hartman = people.find((p) => p.lastName === 'Hartman');
        if (hartman) {
          await prisma.eventPerson.create({
            data: { eventId: newEvent.id, personId: hartman.id, role: 'subject' },
          });
          console.log('  → Linked to Hartman');
        }
      }
      if (e.title.includes('Callahan')) {
        const callahan = people.find((p) => p.lastName === 'Callahan');
        if (callahan) {
          await prisma.eventPerson.create({
            data: { eventId: newEvent.id, personId: callahan.id, role: 'subject' },
          });
          console.log('  → Linked to Callahan');
        }
      }
      if (e.title.includes('DeMarco')) {
        const demarco = people.find((p) => p.lastName === 'DeMarco');
        if (demarco) {
          await prisma.eventPerson.create({
            data: { eventId: newEvent.id, personId: demarco.id, role: 'subject' },
          });
          console.log('  → Linked to DeMarco');
        }
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log('Created:', created, 'events');

  // Verify
  const childCount = await prisma.event.count({ where: { parentId: orgCrime.id } });
  console.log('Organized Crime in America now has', childCount, 'children');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

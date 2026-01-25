require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get Minnesota article ID
  const mn = await prisma.article.findFirst({ where: { title: 'Minnesota' } });
  if (mn) {
    await prisma.article.update({
      where: { id: mn.id },
      data: {
        content: `**Minnesota** is a state in the upper midwestern [[United States]]. Known as the "Land of 10,000 Lakes," it is characterized by its abundant natural beauty, harsh winters, and Scandinavian heritage.

## Geography

Minnesota borders [[Wisconsin]] to the east, [[Iowa]] to the south, and the Dakotas to the west. The state contains the headwaters of the Mississippi River at Lake Itasca. Its northern border touches Canada.

## Economy

The Twin Cities of Minneapolis and St. Paul form the state's economic hub, home to major flour milling operations and a growing manufacturing sector. Agriculture, particularly dairy farming and wheat production, remains central to the state economy.

## See also

- [[United States]]
- [[Chicago]]`,
        infobox: {
          type: 'place',
          fields: {
            Type: 'U.S. State',
            Region: 'Midwest',
            Capital: 'St. Paul',
            Country: '[[United States]]',
            Nickname: 'Land of 10,000 Lakes'
          }
        }
      }
    });
    console.log('Updated Minnesota');
  }

  // Get Connecticut article ID
  const ct = await prisma.article.findFirst({ where: { title: 'Connecticut' } });
  if (ct) {
    await prisma.article.update({
      where: { id: ct.id },
      data: {
        content: `**Connecticut** is a state in the northeastern [[United States]], one of the six New England states. It is the southernmost state in the New England region and one of the smallest states by area.

## Geography

Connecticut borders [[Massachusetts]] to the north, Rhode Island to the east, [[New York]] to the west, and Long Island Sound to the south. The Connecticut River runs through the center of the state.

## Economy

Connecticut has a diverse economy centered on manufacturing, insurance, and finance. The state is home to major insurance companies headquartered in Hartford, the state capital. Its coastal cities maintain shipbuilding and maritime industries.

## Education

The state is home to [[Yale University]] in New Haven, one of the nation's most prestigious institutions of higher learning.

## See also

- [[United States]]
- [[New York]]
- [[Massachusetts]]`,
        infobox: {
          type: 'place',
          fields: {
            Type: 'U.S. State',
            Region: 'New England',
            Capital: 'Hartford',
            Country: '[[United States]]',
            Nickname: 'The Constitution State'
          }
        }
      }
    });
    console.log('Updated Connecticut');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

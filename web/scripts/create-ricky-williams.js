const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  // Create the person record
  const person = await prisma.person.create({
    data: {
      firstName: 'Richard',
      lastName: 'Williams',
      gender: 'male',
      dateBorn: new Date('1898-03-12'),
      dateDied: null,
    }
  });
  console.log('Created person:', person.firstName, person.lastName, '(ID:', person.id, ')');

  const content = `**Richard "Ricky" Williams** (born [[March 12, 1898 k.y.|March 12, 1898]]) is an American sports executive and president of the [[Cleveland Scouts]] of [[United League Baseball]]. He is best known for signing [[Willie Banks]] in 1947, breaking baseball's color barrier and integrating the league.

## Early life

Williams was born in [[Cleveland]], [[Ohio]], to a working-class family. His father was a machinist; his mother took in laundry. Young Richard grew up loving baseball, playing sandlot games in Cleveland's neighborhoods and dreaming of a career in the sport.

Unable to afford college, Williams went to work in Cleveland's factories after high school. His intelligence and drive led to rapid advancement, and by his thirties he had saved enough to start his own manufacturing business, which prospered through the 1920s and 1930s.

## Business career

Williams built a small empire in Cleveland manufacturing, producing auto parts and industrial equipment. His success made him wealthy, but his first love remained baseball. When the Cleveland Scouts came up for sale in 1944, Williams seized the opportunity to fulfill a lifelong dream.

## Cleveland Scouts ownership

### Taking over

Williams purchased the Cleveland Scouts in early 1944, inheriting a struggling franchise with outdated facilities and declining attendance. He immediately set about transforming the organization, improving the stadium, investing in player development, and introducing promotional innovations that brought fans back to the ballpark.

### Breaking the color barrier

Williams had long believed that baseball's informal ban on Black players was both morally wrong and bad business. "There are great ballplayers being kept out of our game for no good reason," he told associates. "That's not right, and it's not smart."

In 1947, Williams signed [[Willie Banks]] from the Negro Leagues, making Banks the first Black player in [[United League Baseball]] history. The decision was controversial—other owners were furious, and Williams received threats—but he never wavered. "I signed him because he can play," Williams said. "That's what should matter."

### Promotional genius

Beyond integration, Williams revolutionized how baseball was marketed. He introduced fireworks nights, giveaway promotions, and fan appreciation events. He believed baseball should be entertainment for families, not just a sport for purists. His innovations were initially mocked by traditionalists but widely imitated once they proved successful.

## Philosophy

Williams approaches baseball as both a business and a moral enterprise. He believes in treating players fairly, engaging fans creatively, and doing what's right even when it's unpopular. His willingness to challenge baseball's establishment has made him enemies among conservative owners, but he remains unbowed.

"The game belongs to the fans," Williams has said. "Our job is to give them something worth watching and to do it the right way."

## Personal life

Williams lives in Cleveland with his wife Margaret. They have three children. Despite his wealth, he maintains close ties to the working-class community where he grew up, supporting local charities and youth baseball programs.

## Legacy

Richard Williams's decision to sign Willie Banks changed American sports forever. By proving that integration could work—and that it was good for business—he helped pave the way for the full integration of professional athletics. His promotional innovations transformed how sports franchises engage with fans.

## See also

- [[Willie Banks]]
- [[Cleveland Scouts]]
- [[United League Baseball]]`;

  // Create the article
  const article = await prisma.article.create({
    data: {
      title: 'Richard Williams',
      type: 'person',
      subtype: 'sports-executive',
      status: 'published',
      publishDate: new Date('1950-12-31'),
      tags: ['baseball', 'sports', 'cleveland', 'integration', '1947'],
      dates: ['March 12, 1898 k.y.', 'April 15, 1947 k.y.'],
      infobox: {
        type: 'person',
        fields: {
          'Born': '[[March 12, 1898 k.y.|March 12, 1898]]',
          'Birthplace': '[[Cleveland]], [[Ohio]]',
          'Occupation': 'Sports executive, businessman',
          'Known for': 'Integrating [[United League Baseball]]',
          'Team': '[[Cleveland Scouts]] (President)',
          'Years active': '1944–present'
        }
      },
      content: content
    }
  });
  console.log('Created article:', article.title, '(ID:', article.id, ')');

  // Link article to person
  await prisma.person.update({
    where: { id: person.id },
    data: { articleId: article.id }
  });
  console.log('Linked article to person');

  // Create inspiration records
  await prisma.inspiration.createMany({
    data: [
      {
        subjectId: person.id,
        subjectType: 'person',
        inspiration: 'Bill Veeck',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Bill_Veeck'
      },
      {
        subjectId: person.id,
        subjectType: 'person',
        inspiration: 'Branch Rickey',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Branch_Rickey'
      }
    ]
  });
  console.log('Created 2 inspiration records');

  console.log('\nPerson ID for image:', person.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());

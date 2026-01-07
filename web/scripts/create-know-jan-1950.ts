import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const seriesId = "cmk27j1g70002iti6laaw3j8l";
  const arthurHaleId = "cmk27f9xo0002itecomjd1dtz";
  const thomasChambersId = "cmk27gdz60002itfj93dlw712";
  const eleanorBrooksId = "cmk27hj7h0002itgvd89y5w30";

  // Create the January 1950 issue
  const issue = await prisma.publication.create({
    data: {
      title: "Know! - January 1950",
      type: "magazine",
      seriesId: seriesId,
      kyDate: new Date("1950-01-15"),
      volume: 23,
      issueNumber: 1,
      pageCount: 96,
      description: "The first issue of 1950 examines the fall of China to communism, the aftermath of the Whitfield Committee hearings, and the rise of television.",
    },
  });
  console.log("Created issue:", issue.id);

  // COVER
  await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "RED CHINA",
      subtitle: "The World Has Changed",
      type: "cover",
      content: "January 1950 — Volume XXIII, Number 1",
      sortOrder: 1,
      layoutStyle: "full_bleed",
    },
  });
  console.log("Created: Cover");

  // TABLE OF CONTENTS
  await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "Contents",
      type: "table_of_contents",
      content: `## In This Issue

**INTERNATIONAL**
- Red Dawn in the East — What Communist China Means for America
- The Chairman — A Profile of Chen Zhaoming

**NATIONAL AFFAIRS**
- The Whitfield Report — What the Committee Found, and What It Didn't

**BUSINESS**
- The People's Car — How the Continental Courier Conquered America

**SCIENCE**
- The Desert Mystery — Questions That Won't Go Away

**CULTURE**
- Mr. Television — Bernie Kessler and the Box That Changed Everything

**DEPARTMENTS**
- From the Editor
- Letters
- Faces and Places`,
      sortOrder: 2,
    },
  });
  console.log("Created: Table of Contents");

  // EDITOR'S LETTER
  const editorsLetter = await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "From the Editor",
      subtitle: "A New Decade Begins",
      type: "column",
      content: `As we enter 1950, Know! begins its twenty-third year of publication with perhaps the most consequential issue we have ever assembled.

The world we knew in 1949 no longer exists. China—home to one-quarter of humanity—has fallen to communist revolution. The implications of this transformation will shape American foreign policy, military strategy, and domestic politics for generations to come.

Here at home, the Whitfield Committee has concluded its investigation into the Antelope Springs Incident. The committee's findings, or lack thereof, raise troubling questions about what our government knows and what it chooses to tell us.

Yet America remains resilient. Our factories hum with peacetime production. Our living rooms glow with the blue light of television. Our roads fill with automobiles that would have seemed fantastical a decade ago.

This issue of Know! attempts to make sense of these contradictions—the shadow of global conflict and the brightness of domestic prosperity, the mysteries our government cannot explain and the marvels our industries produce daily.

The 1950s have begun. Let us understand them together.

*— Thomas Chambers, Editor-in-Chief*`,
      sortOrder: 3,
      useDropcap: true,
    },
  });
  await prisma.newsPubContentElement.create({
    data: { contentId: editorsLetter.id, personId: thomasChambersId, role: "author" },
  });
  console.log("Created: From the Editor");

  // MAIN FEATURE - RED CHINA
  const redChina = await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "Red Dawn in the East",
      subtitle: "What Communist China Means for America and the World",
      type: "feature",
      content: `On October 1, 1949, Chen Zhaoming stood at Tiananmen Gate in Beijing and proclaimed words that will echo through history: "The Chinese people have stood up."

With that declaration, the world's most populous nation joined the communist bloc. Five hundred million people—more than twice the population of the United States and Soviet Union combined—now live under the red flag.

## The Fall

The speed of the Nationalist collapse stunned American observers. As recently as 1947, Chiang Kai-shek's forces controlled most of China's major cities. American military advisors spoke confidently of eventual victory over the communist insurgency.

What went wrong?

The answers are as complex as China itself. Corruption had hollowed out the Nationalist government. Inflation destroyed the savings of the middle class. Peasants who had endured Japanese occupation found little improvement under Nationalist rule.

Meanwhile, Chen Zhaoming's forces grew stronger. Communist cadres promised land reform. Their armies, battle-hardened from years of guerrilla warfare against Japan, proved more disciplined than their Nationalist counterparts.

By late 1948, the tide had turned irreversibly. City after city fell to communist forces. Chiang Kai-shek fled to the island of Taiwan, taking what remained of his government and the national treasury.

## The Implications

For American policymakers, the "loss" of China represents a strategic catastrophe of the first order.

The containment strategy that has guided American foreign policy since 1947 assumed a world divided between communist and free nations, with the United States supporting the latter against Soviet expansion. China was meant to be a cornerstone of the free world in Asia.

Now that cornerstone has crumbled.

"We are witnessing the greatest single defeat for American foreign policy in our lifetime," Senator William Knowland declared on the Senate floor. "Someone must be held accountable."

The question of "who lost China" will dominate Washington politics in the months ahead. State Department officials who warned of Nationalist weakness find themselves accused of disloyalty. China specialists are being purged from government service.

## Looking East

What kind of nation will Communist China become? Will it follow the Soviet model of rapid industrialization through central planning? Will it seek to export revolution to its neighbors?

These questions cannot yet be answered. Chen Zhaoming has consolidated power, but the enormity of governing China—with its regional differences, its hundreds of millions of peasants, its underdeveloped industry—poses challenges that ideology alone cannot solve.

One thing is certain: the Pacific Ocean no longer separates America from the communist world. The Cold War has come to Asia.

And nothing will ever be the same.`,
      sortOrder: 4,
      layoutStyle: "full_bleed",
      pullquotes: ["Five hundred million people now live under the red flag.", "The Cold War has come to Asia."],
      useDropcap: true,
      columns: 2,
    },
  });
  await prisma.newsPubContentElement.create({
    data: { contentId: redChina.id, personId: arthurHaleId, role: "author" },
  });
  console.log("Created: Red Dawn in the East");

  // CHEN ZHAOMING PROFILE
  const chenProfile = await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "The Chairman",
      subtitle: "Chen Zhaoming: Revolutionary, Poet, Ruler of Half a Billion Souls",
      type: "feature",
      content: `He writes poetry in classical forms. He chain-smokes cigarettes. He has not left China in over two decades. And he now commands a nation larger than any single ruler in human history.

Chen Zhaoming, 56, Chairman of the Chinese People's Party, is the most powerful communist leader since Lenin—and perhaps the most enigmatic figure on the world stage.

## The Revolutionary

Born to a prosperous peasant family in Hunan Province, Chen received a classical education before being swept up in the revolutionary ferment of early twentieth-century China. He joined the Communist Party in 1921 and quickly distinguished himself as both a theorist and an organizer.

Where other communist leaders looked to the Soviet model of urban revolution led by industrial workers, Chen developed a different vision: revolution rooted in China's vast peasantry. "The peasants are the sea," he wrote, "and the revolutionary army must swim in that sea."

This insight would prove decisive. While Nationalist forces controlled the cities, communist organizers built support in the countryside. The strategy that had been pioneered elsewhere in the communist movement found its fullest expression in Chen's campaigns.

## The Survivor

Chen's path to power was marked by extraordinary hardship. The Long March of 1934-35—a 6,000-mile retreat through some of China's most punishing terrain—killed the majority of those who began it. Chen emerged as the party's undisputed leader.

During the war against Japan, Chen's forces fought from remote base areas, growing stronger as Nationalist armies bore the brunt of Japanese attacks. Critics accuse Chen of prioritizing the coming civil war over resistance to Japan. Supporters argue that his strategy preserved the revolutionary movement for ultimate victory.

## The Unknown

What does Chen Zhaoming want for China? His public statements promise land reform, industrialization, and the elimination of foreign influence. He speaks of China's century of humiliation at the hands of imperial powers and pledges that such humiliation will never recur.

But the methods of communist rule—the suppression of dissent, the regimentation of society, the subordination of individual rights to collective goals—suggest a future that Americans would find unrecognizable.

Western diplomats who have met Chen describe a man of formidable intelligence, earthy humor, and absolute conviction in his cause. He is, by all accounts, patient, calculating, and utterly ruthless when circumstances require.

He is also, as of October 1, 1949, the ruler of China.`,
      sortOrder: 5,
      pullquotes: ["The peasants are the sea, and the revolutionary army must swim in that sea."],
      useDropcap: true,
    },
  });
  await prisma.newsPubContentElement.create({
    data: { contentId: chenProfile.id, personId: arthurHaleId, role: "author" },
  });
  console.log("Created: The Chairman");

  // WHITFIELD COMMITTEE
  const whitfield = await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "The Whitfield Report",
      subtitle: "What the Committee Found, and What It Didn't",
      type: "feature",
      content: `For three weeks in September, Americans watched as Senator Robert Whitfield of North Carolina presided over hearings that promised to answer the question that had gripped the nation since spring: What really happened at Antelope Springs?

The committee heard from ranchers and military officers, from grieving widows and reluctant generals. It reviewed classified documents and examined physical evidence. And in the end, it produced a report that satisfied almost no one.

## The Witnesses

The hearings began with Virgil Stokes, the New Mexico rancher who discovered the debris field on his property last March. Stokes, weathered and plainspoken, described material unlike anything he had ever encountered—lightweight yet extraordinarily strong, covered in symbols that resembled no known language.

"I've been ranching forty years," Stokes testified. "I know what airplane wreckage looks like. This wasn't airplane wreckage."

Former Army intelligence officer Raymond Colvin provided the most explosive testimony. Colvin, who resigned his commission in April, described being ordered to suppress information about the incident by General Harlan Whitmore. He spoke of debris that defied conventional explanation and of a pilot's final transmission reporting contact with an unknown object.

Margaret Caldwell, widow of test pilot Frank Caldwell, testified about her husband's last day. She produced letters in which Captain Caldwell described unusual aerial phenomena he had observed during test flights—observations he had been instructed not to include in official reports.

General Whitmore, appearing in full uniform, invoked national security to avoid answering many questions. He denied any cover-up while refusing to explain what the military was covering up.

## The Conclusions

The committee's final report, released last month, is a masterpiece of bureaucratic ambiguity.

The debris recovered from the Stokes ranch is described as "material of unknown origin, possibly related to classified military programs." Captain Caldwell's death is attributed to "aircraft malfunction during routine test operations." The discrepancies between witness accounts and official explanations are noted but not resolved.

Senator Whitfield, in a minority statement, wrote that "the American people deserve answers that this committee was unable to obtain."

## The Questions

What fell at Antelope Springs remains officially unknown. The Air Force maintains that no unusual events occurred. Witnesses insist otherwise. The physical evidence has been classified and removed from public access.

For journalist Nathan Collier, whose exposé brought the incident to national attention, the Whitfield Report represents a failure of democratic accountability. "The government has decided that whatever happened in New Mexico is none of our business," Collier wrote. "History may judge whether that decision was justified."

The case remains open in the public imagination, even as official Washington has moved on to other concerns. The truth, whatever it may be, remains buried in the desert—or locked in classified files that the American people may never see.`,
      sortOrder: 6,
      pullquotes: ["I know what airplane wreckage looks like. This wasn't airplane wreckage."],
      useDropcap: true,
      columns: 2,
    },
  });
  await prisma.newsPubContentElement.create({
    data: { contentId: whitfield.id, personId: thomasChambersId, role: "author" },
  });
  console.log("Created: The Whitfield Report");

  // BUSINESS - CONTINENTAL COURIER
  await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "The People's Car",
      subtitle: "How the Continental Courier Conquered America",
      type: "feature",
      content: `Drive through any American suburb and you will see them: sleek, modern, affordable. The Continental Courier, introduced just one year ago, has become the automobile of the American middle class.

## A New Kind of Car

When Continental Motors unveiled the Courier in January 1949, skeptics wondered whether Americans would embrace a smaller, more economical vehicle. The answer came quickly and emphatically: yes.

Sales exceeded 400,000 units in the Courier's first year—a record for any new automobile model. Waiting lists at dealerships stretch into months. The Courier has become, in the words of one industry analyst, "the Model T of the postwar era."

Chief designer Raymond Holbrook created a vehicle that embodies postwar optimism. The Courier's lines are clean and modern, a decisive break from the bulbous prewar aesthetic. Its engine, while modest in power, delivers remarkable fuel economy. Its price—just under $1,500—puts automobile ownership within reach of millions of families.

## The Suburban Dream

The Courier's success reflects broader changes in American life. Veterans returning from war have married, started families, and moved to new suburban developments that require automobile transportation. The G.I. Bill has created a generation of homeowners who need affordable, reliable transportation.

"We didn't design the Courier for enthusiasts," Holbrook explained in a recent interview. "We designed it for families. For the father driving to work, the mother running errands, the teenager learning to drive."

## Continental's Rebirth

For Continental Motors, the Courier represents vindication after difficult years. The death of founder Henry C. Durant in 1947 created uncertainty about the company's future. Competitors questioned whether Continental could adapt to postwar conditions.

The Courier answered those questions definitively. Continental's stock price has more than doubled since the car's introduction. The company is expanding production facilities and hiring thousands of workers.

As America enters the 1950s, the Courier symbolizes the nation's confidence in the future—a future measured in miles driven, suburbs built, and families transported safely home.`,
      sortOrder: 7,
      pullquotes: ["We designed it for families."],
      useDropcap: true,
    },
  });
  console.log("Created: The People's Car");

  // SCIENCE - ANTELOPE SPRINGS MYSTERY
  await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "The Desert Mystery",
      subtitle: "Questions That Won't Go Away",
      type: "feature",
      content: `Nine months after test pilot Frank Caldwell's aircraft crashed in the New Mexico desert, the scientific questions surrounding the Antelope Springs Incident remain unanswered—and increasingly troubling.

## The Evidence

Multiple witnesses described debris unlike any known material. Virgil Stokes, the rancher who first discovered the wreckage, collected samples before military personnel arrived. Those samples, he testified, included:

- Metallic fragments that could not be cut, burned, or permanently deformed
- Thin, flexible material that returned to its original shape after being crumpled
- Components bearing symbols in an unknown writing system

The military confiscated all materials from the Stokes ranch. No independent scientific analysis has been permitted.

## The Transmission

Perhaps most puzzling is Captain Caldwell's final radio transmission. According to multiple sources, including testimony before the Whitfield Committee, Caldwell reported visual contact with an unidentified object before his aircraft went down.

"Cal said it was like nothing he'd ever seen," his widow testified. "Disk-shaped. Moving in ways that no aircraft could move."

The Air Force maintains that Caldwell experienced equipment malfunction and possible disorientation. This explanation does not account for the debris field discovered the following day, located several miles from the crash site.

## The Silence

Scientists who have sought access to the recovered materials have been rebuffed. Dr. Werner Hoffman, a physicist who consulted briefly with the military investigation, resigned after being ordered to sign non-disclosure agreements he considered unconscionable.

"I cannot say what I saw," Hoffman told Know! in a brief interview. "I can only say that the official explanations do not satisfy the evidence."

## The Possibilities

If the debris recovered at Antelope Springs is not from Captain Caldwell's aircraft, what is it? Speculation ranges from secret Soviet technology to experimental American programs—to possibilities that most scientists are reluctant to discuss publicly.

The universe is vast. Our understanding of it remains limited. The assumption that Earth has never been visited by intelligences from elsewhere is precisely that—an assumption.

Science requires evidence, and the evidence from Antelope Springs remains locked away. Until it is released for independent examination, the mystery will endure.`,
      sortOrder: 8,
      pullquotes: ["The official explanations do not satisfy the evidence."],
      useDropcap: true,
    },
  });
  console.log("Created: The Desert Mystery");

  // CULTURE - BERNIE KESSLER
  const culture = await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "Mr. Television",
      subtitle: "Bernie Kessler and the Box That Changed Everything",
      type: "feature",
      content: `On Tuesday nights, America stops.

Restaurants empty. Movie theaters report their lowest attendance of the week. Telephone traffic drops to near zero. The reason stands five feet seven inches tall, weighs 160 pounds, and answers to the name Bernie Kessler.

## The Numbers

Industry analysts estimate that 80% of all television viewers tune in to *The Bernie Kessler Hour* on UBC. In cities with television service, the show regularly captures over 90% of the available audience. No program in the history of any medium has achieved such dominance.

The effect on American life has been profound. Television set sales have tripled since the show's premiere in September 1948. Families who never considered purchasing a television now regard it as essential—because everyone talks about what Bernie did last night.

## The Man

Bernard Kessler, 41, grew up in Brooklyn, the son of Jewish immigrants. He worked the Catskills comedy circuit, performed in vaudeville, and appeared in supporting roles on radio before UBC took a chance on him for their new television venture.

"Radio was words," Kessler explains. "Television is everything—words, faces, movement, timing. It's the most demanding medium ever invented. And the most rewarding."

Kessler's format combines comedy sketches, musical performances, and a manic energy that seems perfectly suited to the small screen. He mugs, he pratfalls, he breaks into song. He makes the studio audience feel like participants rather than observers.

"Bernie doesn't perform for the camera," says UBC programming chief Milton Berle. "He performs through it. He reaches into your living room and grabs you."

## The Future

Television is no longer a curiosity. It is becoming the dominant medium of American culture, and Bernie Kessler is its first great star.

The implications extend beyond entertainment. Politicians are learning that television requires different skills than radio. Advertisers are shifting budgets from print to broadcast. The way Americans receive information about their world is changing fundamentally.

And every Tuesday night, they gather around the glowing screen to watch a comedian from Brooklyn make them laugh.

"I just try to give people a good time," Kessler says. "They work hard all week. They deserve an hour of fun."

Eighty percent of America agrees.`,
      sortOrder: 9,
      pullquotes: ["Bernie doesn't perform for the camera. He performs through it."],
      useDropcap: true,
    },
  });
  await prisma.newsPubContentElement.create({
    data: { contentId: culture.id, personId: eleanorBrooksId, role: "author" },
  });
  console.log("Created: Mr. Television");

  // BACK COVER
  await prisma.newsPubContent.create({
    data: {
      publicationId: issue.id,
      title: "Know! Back Cover",
      type: "back_cover",
      content: "*Subscribe to Know! Magazine — America's Window on the World. One year (12 issues) for just $4.00.*",
      sortOrder: 10,
    },
  });
  console.log("Created: Back Cover");

  console.log("\n=== Issue Complete ===");
  console.log("View at: /press/know/" + issue.id);
}

main().finally(() => prisma.$disconnect());

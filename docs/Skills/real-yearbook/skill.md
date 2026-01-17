# Real Yearbook Skill

Create comprehensive historical reference documents for specific years, gathering true real-world data to serve as inspiration for Kempo content.

## Purpose

Real Yearbooks are internal reference documents that capture what actually happened in a given year. They provide the factual foundation from which Kempo storylines, characters, and entities are inspired.

**Key distinction:** These document *real* history, not Kempo fiction. They are titled "The Real [YEAR] Yearbook" to distinguish from the fictional Kempo universe.

## Primary Source: Grokipedia

**Grokipedia is the primary research source for Real Yearbooks.**

For each section, query Grokipedia systematically:
- Ask for comprehensive information about the topic for the specific year
- Follow up with targeted questions to fill gaps
- Cross-reference between sections to identify connecting themes

Example queries:
- "What were the top movies of 1950?"
- "Who were the most famous athletes in 1950?"
- "What was everyday life like for the average American family in 1950?"
- "What were the major political events in the US in 1950?"

## Output Location

```
docs/yearbooks/the-real-YYYY-yearbook.md
```

Example: `docs/yearbooks/the-real-1950-yearbook.md`

## Document Structure

Each yearbook follows this consistent chapter structure:

```markdown
# The Real [YEAR] Yearbook

## Introduction

[Written LAST - synthesizes the year's major themes, mood, and significance.
Sets the stage for understanding what made this year distinctive.]

---

## I. Everyday Life in America

What life was like for ordinary Americans.

### Cost of Living
- Average wages and salaries
- Prices of common goods (bread, milk, gas, etc.)
- Housing costs (rent, home prices)
- What a dollar could buy

### Home & Family
- Typical family structure and size
- Housing (suburban boom? urban apartments?)
- Household technology and appliances
- Gender roles and expectations

### Work Life
- Common occupations
- Workplace culture
- Commuting and transportation
- Labor trends

### Childhood & Youth
- School life
- Play and recreation
- Teen culture
- Popular toys and games

### Food & Dining
- Home cooking trends
- Restaurants and dining out
- Popular foods and brands

### Fashion & Style
- What regular people wore
- Hair and grooming trends
- Regional differences

### Health & Medicine
- Common health concerns
- Medical care accessibility
- Public health issues

### Social Norms & Expectations
- Dating and courtship
- Religion and church attendance
- Community life
- Racial and ethnic dynamics

---

## II. Entertainment & Culture

### Film
- Top box office hits
- Notable releases
- Major studios and stars
- Industry trends

### Television
- Popular shows
- Network developments
- TV adoption rates
- Cultural impact

### Music & Radio
- Top songs and artists
- Radio programming
- Musical trends and genres
- Record labels

### Theater
- Broadway hits
- Notable productions

### Cultural Phenomena & Fads
- Trends and crazes
- Slang and language
- Dance crazes
- Collectibles and hobbies

---

## III. Sports

### Major Championships & Events
- World Series
- NFL Championship
- College football
- Boxing
- Horse racing (Triple Crown)
- Olympics (if applicable)
- Other major events

### Notable Athletes
- Stars of the year
- Breakout performers
- Controversies

### Trends in American Sports
- League developments
- Integration progress
- Business of sports

---

## IV. Business & Commerce

### Major Corporations
- Largest and most influential companies
- Corporate news and developments
- Mergers and expansions

### Brands & Products
- New product launches
- Popular consumer goods
- Advertising trends

### Economic Trends
- GDP and growth
- Employment/unemployment
- Industry trends
- Stock market

---

## V. Organizations

### Influential Groups & Institutions
- Civic organizations
- Professional associations
- Advocacy groups
- Fraternal organizations
- Religious institutions

---

## VI. Domestic Politics

### Federal Government
- President and administration
- Major legislation
- Congressional developments
- Executive actions

### Elections (if applicable)
- Campaigns
- Results
- Significance

### State & Local Highlights
- Notable governors
- State-level developments

### Legal & Supreme Court
- Major decisions
- Notable cases

---

## VII. International Affairs & Military

### Foreign Policy
- Major diplomatic initiatives
- Treaties and agreements
- Allies and adversaries

### Military Operations
- Ongoing conflicts
- Troop deployments
- Defense developments

### Global Context (US Perspective)
- How Americans viewed the world
- International crises
- Cold War developments

---

## VIII. Science, Technology & Innovation

### Major Breakthroughs
- Scientific discoveries
- Medical advances
- Academic achievements

### Products & Inventions
- New technologies
- Consumer innovations
- Patents and firsts

---

## IX. Publications & Print Media

### Newspapers
- Major papers and their influence
- Notable journalism
- Press trends

### Magazines & Periodicals
- Popular magazines
- What they covered
- New launches

### Books
- Bestsellers (fiction and nonfiction)
- Notable literary works
- Award winners

### Comics
- Popular titles
- Industry developments

---

## X. People of the Year

Profiles of 10-20 key figures who shaped the year, drawn from across all domains:
- Politicians and government officials
- Business leaders
- Entertainers and artists
- Athletes
- Scientists and innovators
- Cultural figures
- Newsmakers

For each person:
- Who they are
- What they did this year that was notable
- Why they mattered

---

## XI. The Big Stories

3-5 major narratives that weave together multiple domains and defined the year.

Examples from early 1950s:
- The Korean War (military + politics + culture + everyday life)
- McCarthyism and the Red Scare (politics + entertainment + society)
- The Television Revolution (technology + entertainment + business + everyday life)
- UFO Phenomenon (culture + military + media)
- Organized Crime Hearings (politics + media + society)

For each big story:
- What happened
- Why it mattered
- How it connected different aspects of American life
- Key people and organizations involved

---

## XII. Timeline

Chronological list of key events throughout the year.

Format:
```
### January
- **January X** - Event description
- **January X** - Event description

### February
...
```

Include 5-15 events per month covering all domains.

---

## See Also

- [[the-real-YYYY-yearbook|The Real (YEAR-1) Yearbook]]
- [[the-real-YYYY-yearbook|The Real (YEAR+1) Yearbook]]
```

## Workflow

### Phase 1: Research (Heavy Grokipedia Use)

Work through each section systematically:

1. **Everyday Life** - Query Grokipedia for cost of living, family life, social norms
2. **Entertainment** - Query for top movies, TV shows, music, cultural trends
3. **Sports** - Query for championships, athletes, sports news
4. **Business** - Query for major companies, products, economic conditions
5. **Organizations** - Query for influential groups and institutions
6. **Domestic Politics** - Query for political events, legislation, elections
7. **International** - Query for foreign policy, military, global events
8. **Science/Tech** - Query for breakthroughs, inventions, innovations
9. **Publications** - Query for bestsellers, major newspapers, magazines
10. **People** - Compile notable figures from all sections
11. **Big Stories** - Identify 3-5 connecting narratives
12. **Timeline** - Compile chronological event list

### Phase 2: Writing

1. Write each section based on research gathered
2. Keep tone factual and reference-oriented
3. Focus on what's useful for Kempo inspiration
4. Include specific names, dates, and details

### Phase 3: Introduction

Write the Introduction LAST after all sections are complete:
- Synthesize the year's major themes
- Capture the mood and zeitgeist
- Highlight what made this year distinctive
- Preview the big stories

### Phase 4: Review

- Verify completeness of all sections
- Check for gaps or thin areas
- Ensure cross-references between sections
- Confirm timeline covers all domains

## Style Guidelines

- **Factual, not interpretive** - State what happened, not opinions
- **Specific over general** - Names, dates, numbers when available
- **US-centric** - International events from American perspective of the time
- **Scannable** - Use headers, bullets, and clear organization
- **No citations needed** - Internal reference document
- **No images** - Text only

## Versioning

If significant new information is discovered later, update the yearbook rather than creating a new version. Add a note at the top:

```markdown
> Last updated: [DATE] - Added [what was added]
```

## Example Invocation

User: "Create a Real Yearbook for 1952"

Response: Follow this skill to create `docs/yearbooks/the-real-1952-yearbook.md` using Grokipedia as the primary research source.

# Kempo Yearbook Skill

Create the architectural planning documents that guide Kempo content creation for a specific year.

## Overview

This skill produces **two documents** for each year:

1. **Kempo [YEAR] Yearbook Analysis** - The working document showing translation from real history
2. **Kempo [YEAR] Yearbook** - The clean final output of what happened in Kempo

Read [guiding-principles.md](../../yearbooks/guiding-principles.md) for the foundational philosophy before using this skill.

## Prerequisites

Before creating a Kempo Yearbook:

1. **The Real [YEAR] Yearbook must exist** at `docs/yearbooks/the-real-YYYY-yearbook.md`
   - If it doesn't, use the [real-yearbook skill](../real-yearbook/skill.md) first

2. **Database access** to query existing Kempo content
   - People, Organizations, Brands, Products
   - Events, Locations
   - Articles, Publications, Media

## Output Files

```
docs/yearbooks/kempo-YYYY-yearbook-analysis.md
docs/yearbooks/kempo-YYYY-yearbook.md
```

---

# Part 1: Creating the Yearbook Analysis

The Analysis document is created first. It contains the translation process and planning.

## Analysis Document Structure

```markdown
# Kempo [YEAR] Yearbook Analysis

## Preamble

- Year being covered
- Current simulation date
- Key themes to focus on
- High-level inventory summary

---

## I. Everyday Life

### Existing Foundation
[What Kempo content exists for everyday life in this era]

### Real-World Inspiration
[Key points from Real Yearbook Section I]

### Gap Analysis
[What's missing - cost of living details, social norms, etc.]

### New Creations
[Proposed new content with compression logic and naming rationale]

### The Kempo Story
[Synthesized narrative of everyday life in Kempo this year]

---

## II. Entertainment & Culture
[Same five-part structure]

---

## III. Sports
[Same five-part structure]

---

## IV. Business & Commerce
[Same five-part structure]

---

## V. Organizations
[Same five-part structure]

---

## VI. Politics
[Same five-part structure]

---

## VII. International Affairs
[Same five-part structure]

---

## VIII. Science & Technology
[Same five-part structure]

---

## IX. Publications
[Same five-part structure]

---

## X. People of the Year

### Existing Figures
[Kempo people already established who are prominent this year]

### New Figures Proposed
[New people created in the domain sections above, consolidated here]

### Profiles
[Brief profile of each key figure with their role in the year]

---

## XI. The Big Stories

Identify 3-5 major narratives that weave across domains.

For each:
- What happens (the Kempo version)
- Real-world inspiration
- Which domains it touches
- Key people and organizations involved
- How it connects to existing Kempo content
- Seeds planted for future years

---

## XII. Timeline

Month-by-month chronology of Kempo events.

```markdown
### January
- **January X** - Event description
- **January X** - Event description

### February
[etc.]
```

---

## XIII. Content Creation Roadmap

### Priority 1: Core Articles Needed
- [ ] Article: [Name] - [Type] - [Brief description]
- [ ] Article: [Name] - [Type] - [Brief description]

### Priority 2: World Data to Create
- [ ] Person: [Name] - [Role/Description]
- [ ] Organization: [Name] - [Type/Description]
- [ ] Brand: [Name] - [Parent Org] - [Description]
- [ ] Event: [Name] - [Date] - [Description]

### Priority 3: Media to Create
- [ ] Video: [Title] - [Type] - [Description]
- [ ] Audio: [Title] - [Type] - [Description]
- [ ] Publication: [Title] - [Type] - [Description]

### Research Needed
- [ ] Verify name: [Proposed name] - [Check for trademarks/famous people]
- [ ] [Other research items]
```

---

## Workflow for Analysis Document

### Phase 1: Inventory (Query Database)

Run database queries to gather existing Kempo content relevant to the year.

```typescript
// Example queries to run via Prisma

// People alive and active in the year
const people = await prisma.person.findMany({
  where: {
    birthDate: { lte: new Date('YYYY-12-31') },
    OR: [
      { deathDate: null },
      { deathDate: { gte: new Date('YYYY-01-01') } }
    ]
  },
  include: { article: true }
});

// Organizations active
const orgs = await prisma.organization.findMany({
  where: {
    foundedDate: { lte: new Date('YYYY-12-31') }
  }
});

// Events in or before this year
const events = await prisma.event.findMany({
  where: {
    date: { lte: new Date('YYYY-12-31') }
  },
  orderBy: { date: 'desc' },
  take: 100
});

// Articles (for reference)
const articles = await prisma.article.findMany({
  select: { id: true, title: true, slug: true }
});
```

Organize findings by domain (Entertainment, Politics, Sports, etc.).

### Phase 2: Read Real Yearbook

Read `docs/yearbooks/the-real-YYYY-yearbook.md` thoroughly.

For each domain section, extract:
- Key themes and trends
- Major figures and their significance
- Important events and dates
- Cultural touchstones

### Phase 3: Gap Analysis

For each domain, compare:
- What the Real Yearbook says was important
- What Kempo already has

Identify gaps:
- Missing archetypes (no TV personality, no boxing champion, etc.)
- Missing organizations (no major studio, no political party, etc.)
- Missing events (no equivalent to major historical moment)
- Missing products/brands (no car brand, no consumer goods)

Prioritize gaps by:
1. **Cultural significance** - How central was this to the era?
2. **Storytelling potential** - Does this enable rich narratives?
3. **Connection to existing content** - Does this extend what we've built?

---

### Phase 3-A: Cross-Reference Simulation Planning Documents

**CRITICAL:** Before finalizing gaps, cross-reference against the simulation planning documents. These contain pre-planned entities and storylines that should inform the yearbook.

#### 1. Check `possible-inspirations.md`

Location: `web/content/admin/possible-inspirations.md`

- What character inspirations are marked HIGH priority for this era?
- Which have been created? Which are still needed?
- Are there "Suggested Creation Order" items for this year?

#### 2. Check `character-development-plan.md`

Location: `web/content/admin/character-development-plan.md`

- What archetypes are listed for this era (Tier 1, Tier 2, etc.)?
- Which have been marked as CREATED?
- Which are still pending?
- What storyline connections are proposed?

#### 3. Check `products-companies-culture.md`

Location: `web/content/admin/products-companies-culture.md`

- What brands/products are listed in "Priority Gaps to Fill"?
- Which real-world brands need Kempo equivalents?
- What's marked as HIGH vs MEDIUM vs LOW priority?

#### 4. Check `human-drama-amplification.md`

Location: `web/content/admin/human-drama-amplification.md`

- What drama types are relevant to this year?
- What character types enable these stories (The Ingenue, The Torch Singer, etc.)?
- What settings/crossroads are needed?
- What "Potential Storylines" could apply?

#### 5. Check `real-world-events.md`

Location: `web/content/admin/real-world-events.md`

- What events are listed under "Potential Kempo Storylines" for this timeframe?
- Are there event causality chains we should trace?

---

### Phase 3-B: Run Gap Checklists

Work through these checklists to ensure systematic coverage:

#### Character Archetype Checklist

**Entertainment:**
- [ ] Mr. Television / TV comedy star
- [ ] TV comedy couple (sitcom pioneers)
- [ ] Western film star
- [ ] Western TV star
- [ ] Movie actress (glamour/leading lady)
- [ ] Movie actress (ingenue/girl-next-door)
- [ ] Movie actress (rival/femme fatale type)
- [ ] Film director (prestige)
- [ ] Film director (genre - Western, thriller, etc.)
- [ ] Studio head/mogul
- [ ] Crooner/pop singer (male)
- [ ] Female vocalist
- [ ] Jazz musician(s)
- [ ] Torch singer (nightclub performer)
- [ ] Broadway star

**Media & Journalism:**
- [ ] Broadcast journalist (TV news anchor)
- [ ] Gossip columnist
- [ ] Investigative journalist
- [ ] Newspaper publisher/owner
- [ ] TV/Radio network executive

**Politics & Government:**
- [ ] FBI Director equivalent
- [ ] CIA/Intelligence chief
- [ ] Key cabinet members (Secretary of State, Defense)
- [ ] Rising political figure (McCarthy type)
- [ ] Crime-fighting Senator (Kefauver type)

**Sports:**
- [ ] Baseball hero
- [ ] Baseball barrier-breaker (Jackie Robinson type)
- [ ] Boxing champion
- [ ] Boxing contender
- [ ] Other sports figures as relevant

**Crime & Underworld:**
- [ ] Crime boss
- [ ] Mob lieutenant
- [ ] Mob girlfriend/moll
- [ ] Corrupt union leader
- [ ] Crooked cop
- [ ] Nightclub owner (mob-connected)

**Science & Military:**
- [ ] Atomic scientist (Oppenheimer type)
- [ ] Military general(s)
- [ ] Test pilot/aviator

**Human Drama Characters:**
- [ ] War widow/sweetheart
- [ ] Charismatic preacher
- [ ] Press agent/fixer (Hollywood scandal enabler)
- [ ] Bartender/working-class everyman

#### Institutional Leader Checklist

For each institution, ask "Who runs this in Kempo?"

- [ ] FBI / Federal law enforcement
- [ ] CIA / Intelligence apparatus
- [ ] TV Networks (UBC exists - who runs it? Other networks?)
- [ ] Movie Studios (Pacific Pictures, Pinnacle - who are the moguls?)
- [ ] Record Labels (Sunbright - who else?)
- [ ] Major Newspapers (NY Standard, Motor City News - who owns them?)
- [ ] Unions (ADU has Callahan - others?)
- [ ] Political Parties (National Party, Federal Party - key figures?)
- [ ] Veterans Organizations (AVL - leadership?)
- [ ] Civil Rights Organizations (NAMR - key lawyers?)

#### Consumer Brand Checklist

Ensure Kempo has fictional brands for everyday items:

- [ ] **Cigarettes** - Koala ✓ (any others needed?)
- [ ] **Beer** - Feldmann ✓ (regional brands?)
- [ ] **Soft Drinks** - MISSING - need Coca-Cola/Pepsi equivalent
- [ ] **Automobiles** - Continental ✓, Pioneer ✓ (sufficient?)
- [ ] **Airlines** - MISSING - need Pan Am/TWA equivalent
- [ ] **Oil Companies** - MISSING - need Standard Oil/Texaco equivalent
- [ ] **Department Stores** - Hartwell's ✓ (others?)
- [ ] **Appliances/TV** - MISSING - need RCA/Zenith equivalent
- [ ] **Food Brands** - (as needed for specific scenes)

#### Human Drama Checklist

What tabloid-worthy stories should exist this year?

- [ ] Any celebrity romances to portray?
- [ ] Any weddings or engagements?
- [ ] Any scandals or controversies?
- [ ] Any divorces or breakups?
- [ ] Any rivalries between existing characters?
- [ ] Any mob/crime storylines?
- [ ] Any love triangles?
- [ ] Any career comebacks or falls from grace?
- [ ] Any human interest stories?

#### Key Settings Checklist

Do we have specific named locations for key scenes?

- [ ] **The Nightclub** - Where Hollywood/mob/politics mix (Ciro's equivalent)
- [ ] **Las Vegas Casino** - Lucky Sands exists; developed enough?
- [ ] **The Luxury Hotel** - Claridge, Royale Imperial exist; others?
- [ ] **The Working-Class Bar** - Where regular people gather
- [ ] **The Studio Lot** - Specific Pacific Pictures/Pinnacle locations?
- [ ] **The Courtroom** - For trial drama

---

### Phase 3-C: Gender & Diversity Audit

Before finalizing the gap analysis, explicitly audit:

#### Women Characters
- How many significant women appear in this year's content?
- Are they diverse in role (not just actresses/singers)?
- Do we have:
  - [ ] Women in entertainment (multiple, with different types)
  - [ ] Women in journalism/media
  - [ ] Women connected to crime/underworld
  - [ ] Women on the home front (war wives, mothers)
  - [ ] Working women outside entertainment

#### Working Class / Everyday People
- Do we have perspectives beyond celebrities and powerful figures?
- Characters who represent ordinary Americans?

#### Supporting Characters
- Do we have characters who witness events, not just make them?
- Bartenders, assistants, neighbors who provide perspective?

---

### Phase 3-D: Relationship Mapping

For existing characters active this year, map their relationships:

```
[Character A] ←→ [Character B]: [Relationship type]
```

Examples:
- Frank Martino ←→ Vivian Sterling: Rumored romance? Professional connection?
- Vivian Sterling ←→ Dorothy Sherwood: Rivals? Friends?
- Salvatore Conti ←→ Jack Callahan: Business partners (union/mob connection)

Ask:
- What relationships should develop this year?
- What rivalries should intensify?
- What new connections form?
- What relationships break down?

### Phase 4: New Creations

For each prioritized gap, use the **[design-entity skill](../design-entity/skill.md)** to create a Kempo equivalent.

The design-entity skill provides a structured five-phase workflow:
1. **Discovery** — Check existing content, define compression sources
2. **Naming** — Generate options, check for conflicts (database AND real-world)
3. **Profile** — Draft details, document compression logic, "rhyme check"
4. **Cluster** — Identify and create related elements (founders, sidekicks, etc.)
5. **Documentation** — Record in yearbook with full rationale

**Key principle:** Rhyme, don't copy. Names and biographies should resonate with real history without directly copying it.

See the design-entity skill for the full workflow, naming approaches, and conflict-checking procedures.

---

### Phase 4-A: Document Connections for Each New Entity

For every new entity created, document not just WHO they are but HOW they connect:

#### For New People

```markdown
### [Character Name]

**Compression Sources:** [2-4 real-world inspirations]

**The Twist:** [What makes this character original]

**Role in This Year:** [What they do/accomplish in this year's events]

**Connections to Existing Characters:**
- Works with: [List]
- Rivals with: [List]
- Friends/allies with: [List]
- Romantic connections: [List]
- Professional relationships: [List]

**Connections to Existing Organizations:**
- Employed by: [Organization]
- Affiliated with: [Organizations]
- Antagonist to: [Organizations]

**Settings They Appear In:**
- [Nightclub name], [Hotel name], etc.

**Future Potential:**
- Seeds for future years: [What storylines this enables]
```

#### For New Organizations/Brands

```markdown
### [Organization/Brand Name]

**Compression Sources:** [Real-world equivalents]

**The Twist:** [What makes this original]

**Leadership:**
- Founded by: [Person] (existing or new)
- Run by: [Person] (existing or new)

**Connections to Existing Entities:**
- Parent organization: [If applicable]
- Competitors: [List]
- Partners: [List]
- Clients/customers: [List of people who use this brand]

**Role in This Year:** [What happens with this entity]

**Future Potential:** [Where this leads]
```

#### For New Locations/Settings

```markdown
### [Location Name]

**Inspired By:** [Real-world equivalent]

**The Twist:** [What makes this original]

**Who Owns/Runs It:** [Person - existing or new]

**Who Frequents It:**
- Regular patrons: [List]
- Notable visitors: [List]

**What Happens Here:**
- Type of scenes enabled: [Deals, romances, confrontations, etc.]

**Connections:**
- Other locations nearby
- Organizations that use this space
```

### Phase 5: Synthesize Domain Stories

For each domain, write "The Kempo Story" section:
- What happens in this domain in Kempo this year
- Weave together existing content and new creations
- Ensure cause-and-effect logic
- Plant seeds for future years

### Phase 6: Identify Big Stories

Look for narratives that cross multiple domains:
- A political crisis that affects business and culture
- A technological change that transforms everyday life
- A person whose story touches entertainment, politics, and society

Draft 3-5 Big Stories with their cross-domain connections.

### Phase 7: Build Timeline

Compile events into a month-by-month chronology:
- Pull from existing Kempo events
- Add new events from the domain sections
- Ensure logical sequencing

**Note:** This timeline section becomes the source of truth for what events must appear in the Kempopedia timeline page during content creation. See [yearbook-to-content](../Workflows/yearbook-to-content/skill.md) Phase 5 for the sync process.

### Phase 8: Content Creation Roadmap

Consolidate all new creations into an actionable checklist:
- Prioritize by importance and dependencies
- Note what must be created before what
- Flag research items

---

# Part 2: Creating the Final Yearbook

After the Analysis is complete and reviewed, create the clean Yearbook.

## Final Yearbook Structure

```markdown
# Kempo [YEAR] Yearbook

## Introduction

[Written LAST - synthesizes the year's major themes, mood, and significance
in the Kempo universe. Sets the stage for understanding what made this year
distinctive.]

---

## I. Everyday Life in Kempo

[Narrative description of daily life for ordinary Kempo citizens this year.
No process notes - just the story of life in this world.]

### Cost of Living
### Home & Family
### Work Life
### Childhood & Youth
### Food & Dining
### Fashion & Style
### Health & Medicine
### Social Norms & Expectations

---

## II. Entertainment & Culture

### Film
### Television
### Music & Radio
### Theater
### Cultural Phenomena & Fads

---

## III. Sports

### [Major sport 1]
### [Major sport 2]
### [etc.]
### Notable Athletes

---

## IV. Business & Commerce

### Economic Overview
### Major Corporations
### Brands & Products
### Industry Trends

---

## V. Organizations

### [Category 1]
### [Category 2]
### [etc.]

---

## VI. Politics

### [Government/Administration]
### Major Legislation & Policy
### Elections (if applicable)
### Political Movements

---

## VII. International Affairs

### Foreign Policy
### Military Operations
### Global Context

---

## VIII. Science & Technology

### Major Breakthroughs
### Products & Inventions
### Research & Development

---

## IX. Publications

### Newspapers
### Magazines
### Books
### Comics

---

## X. People of the Year

[Profiles of 10-20 key figures who shaped the year]

### [Person Name]
[Who they are and what they did this year]

### [Person Name]
[etc.]

---

## XI. The Big Stories

### [Story 1 Title]
[Narrative of what happened and why it mattered]

### [Story 2 Title]
[etc.]

---

## XII. Timeline

### January
- **January X** - Event
- **January X** - Event

### February
[etc. through December]

---

## See Also

- [[kempo-YYYY-yearbook|Kempo (YEAR-1) Yearbook]]
- [[kempo-YYYY-yearbook|Kempo (YEAR+1) Yearbook]]
```

## Workflow for Final Yearbook

### Step 1: Extract from Analysis

Pull the "Kempo Story" sections from each domain in the Analysis document.

### Step 2: Remove Process Language

Strip out:
- "Existing Foundation" references
- "Gap Analysis" commentary
- "New Creations" rationale
- Research notes
- Any meta-commentary

### Step 3: Write as Kempo History

Rewrite each section as if documenting actual history:
- Third-person, past tense
- Authoritative tone
- No hedging or "we decided" language
- Seamless narrative flow

### Step 4: Write Introduction Last

After all sections are complete, write the Introduction:
- Capture the year's mood and significance
- Preview the major themes
- Set context for what follows

### Step 5: Review for Consistency

Check:
- Names are used consistently throughout
- Dates align with timeline
- Cross-references are accurate
- No process language leaked through

---

## Example Invocation

**User:** "Create a Kempo Yearbook for 1950"

**Response:**

1. Verify `docs/yearbooks/the-real-1950-yearbook.md` exists
2. Query database for existing 1950-era Kempo content
3. Create `docs/yearbooks/kempo-1950-yearbook-analysis.md` following the Analysis workflow
4. Review Analysis with user, iterate as needed
5. Create `docs/yearbooks/kempo-1950-yearbook.md` following the Final Yearbook workflow

---

## Notes

- **Collaboration:** The Analysis document is meant to be worked on collaboratively. Present findings, discuss gaps, and iterate on new creations with the user.

- **Iteration:** New creations may need multiple rounds of naming and refinement before they feel right.

- **Dependencies:** Some content must be created before other content (e.g., an organization before its brands). The Roadmap should reflect this.

- **Living Documents:** Both documents may be updated as new connections are discovered or as actual content is created.

---

## Next Steps: Content Creation

Once both yearbook documents are complete:

1. **Follow [yearbook-to-content](../Workflows/yearbook-to-content/skill.md)** to convert the yearbook into actual Kempo content
2. **Critical:** The yearbook's timeline section (Section XII) must be synced to the Kempopedia timeline page during Phase 5
3. **Verification:** All events from the yearbook timeline should appear in both:
   - The Kempopedia timeline page (e.g., `articles/timelines/1950.md`)
   - The Events database (for significant events, significance 5+)
4. **Bidirectional linking:** Related articles must link back to timeline entries using date wikilinks

---

## Closing the Loop: Update Simulation Planning Documents

After creating yearbook content, **update the simulation planning documents** to reflect what's been done:

### Update `character-development-plan.md`

Mark created characters with:
```markdown
- ~~The Inquisitor (Joseph McCarthy, Roy Cohn)~~ → **CREATED**: [[senator-name|Senator Name]]
```

### Update `products-companies-culture.md`

Mark created brands:
```markdown
- **Soft Drink** - ✓ CREATED: Fizzy Cola
```

### Update `possible-inspirations.md`

Mark created entities and note where gaps remain.

### Update `human-drama-amplification.md`

If new drama types were addressed, note them as covered.

This ensures future yearbook efforts know what's been done and what remains.

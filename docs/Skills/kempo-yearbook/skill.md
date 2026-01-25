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

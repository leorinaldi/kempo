# Design Entity Skill

Design new entities (people, organizations, brands, etc.) for the Kempo universe using a structured workflow that ensures consistency, originality, and proper research.

## Overview

This skill guides the **planning and design phase** before creating Kempopedia articles. It applies when:
- Working through yearbook analysis
- Creating new entities ad-hoc
- Filling gaps discovered during other work
- Expanding storylines

After an entity is designed and approved using this skill, use the appropriate `create-*` skill (create-person, create-organization, etc.) to write the actual Kempopedia article.

## Core Principle: Rhyme, Don't Copy

> "Kempo doesn't perfectly imitate reality, but it is a compressed version with a twist."

The goal is **resonance without imitation**:
- Names should evoke the right feeling without being derivative
- Biographies should parallel real history without copying it
- The result should feel like discovering an alternate history that could have been

---

# The Five-Phase Workflow

## Phase 1: Discovery

### 1.1 Identify the Need
- What gap are we filling? What archetype or role?
- What function does this entity serve in Kempo storytelling?
- Is this for a specific storyline, or general world-building?

### 1.2 Check Existing Kempo Content
**Query the database before creating anything new.**

```typescript
// Example: Check for existing people
const people = await prisma.person.findMany({
  select: { firstName: true, lastName: true, id: true }
});

// Example: Check for existing organizations
const orgs = await prisma.organization.findMany({
  select: { name: true, id: true }
});

// Example: Check inspirations to see what's already been adapted
const inspirations = await prisma.inspiration.findMany({
  select: { realWorldName: true, kempoEntityType: true, kempoEntityId: true }
});
```

Ask:
- Does a similar entity already exist that we can use or extend?
- If a similar entity exists, how is the new one distinct? (e.g., Clay Marshall = dramatic Western star vs. Cody Carson = family-friendly Western star)

### 1.3 Define Compression Sources
Identify 2-3 real-world figures/entities that will inspire this creation.

For each source, note:
- What specific elements this source contributes
- Which aspects we're taking vs. leaving behind
- How sources complement each other

**Example:**
```
Ernest Beckford (author)
├── From Hemingway: War correspondent, muscular prose, larger-than-life persona, multiple marriages
├── From Steinbeck: California setting, Dust Bowl subject matter, social consciousness
└── NOT taking: Hemingway's expatriate years, Steinbeck's Salinas birthplace
```

---

## Phase 2: Naming

### 2.1 Determine Naming Approach

Choose the appropriate strategy based on intent:

| Approach | When to Use | Example |
|----------|-------------|---------|
| **Wink-and-nod** | User wants recognizable homage to originals | Ernest Beckford (Ernest from Hemingway, -beck from Steinbeck + -ford) |
| **Fresh but evocative** | Name should feel right for era/genre without obvious reference | Cody Carson, Clay Marshall, Vivian Sterling |
| **Functional/descriptive** | Organizations, institutions, leagues | United League Baseball, American Steel Corporation |
| **Combined elements** | Blend pieces from multiple inspirations | Frank Martino (Frank Sinatra + Dean Martin) |
| **Era-authentic** | Name should sound plausible for character's birth year, ethnicity, social class | Research name popularity for birth decade |

### 2.2 Generate Name Options
- Propose 2-4 candidates with rationale for each
- For people: consider first name, last name, and potential nicknames
- For organizations: consider what the name signals about the entity's identity

### 2.3 Check for Conflicts

**A. Kempo Database Conflicts**

Query existing tables:
```typescript
// Check Person table
const existingPeople = await prisma.person.findMany({
  select: { firstName: true, lastName: true }
});

// Check Organization table
const existingOrgs = await prisma.organization.findMany({
  select: { name: true }
});
```

Watch for:
- Exact name matches
- Too many of one first name (e.g., multiple Harolds, multiple Arthurs)
- Similar-sounding names that could cause confusion

**B. Real-World Conflicts**

Search for the proposed name in relevant contexts:
- Famous real people with same name in same profession
- Real teams, companies, organizations with same name
- Trademark issues for brand/product names

**Example:** "Philadelphia Stars" was rejected because it was a real Negro League team name.

**C. Fiction Conflicts**

Check if the name has been prominently used in other major fictional universes:
- Avoid obvious parallels already used elsewhere
- Example: "Llama" cigarettes (too obvious a Camel parallel, used in other fiction)

### 2.4 User Selects Name
- Present options with conflict check results
- Get explicit approval before proceeding to profile
- Document why this name was chosen

---

## Phase 3: Profile

### 3.1 Draft Profile

**For People:**
- Full name (including middle name/initial if relevant)
- Birth year and location
- Age in 1950 (or current simulation year)
- Occupation/role
- Key biographical details
- Signature elements (catchphrases, trademark items, style)

**For Organizations:**
- Official name
- Founded date and location
- Founder(s)
- Current leadership (as of 1950)
- Purpose/industry
- Notable characteristics

**For Brands/Products:**
- Name
- Parent organization
- Launch date
- What it's known for

### 3.2 Document Compression Logic

Explicitly note what comes from which inspiration source:

```markdown
**Compression Logic:**
- California setting, social realism, Dust Bowl novel → Steinbeck
- War correspondent, muscular prose, multiple marriages → Hemingway
- "Ernest" first name → direct from Hemingway
- "Beckford" → -beck from Steinbeck + -ford ending
```

### 3.3 "Rhyme Check" — Review for Too-Close-to-Reality

Ask for each detail:
- Is this biographical detail directly copied from a real person?
- Is this place name identical to the real equivalent?
- Would someone immediately recognize this as "just X with the serial numbers filed off"?

**Red Flags:**
- Same birthplace as real inspiration (Salinas for a Steinbeck-inspired author)
- Same team name as real team (Philadelphia Stars)
- Same company name as real company
- Same sequence of life events in same order

**The Fix:** Keep the essence, change the specifics. Kansas origin instead of Salinas. Philadelphia Pennies instead of Philadelphia Stars.

### 3.4 Iterate Based on Feedback

Be prepared to pivot on details while preserving the core concept:
- User may catch issues not flagged in research
- Sometimes a detail "feels wrong" even if technically okay
- The goal is a character/entity that feels natural in Kempo

---

## Phase 4: Cluster Expansion

### 4.1 Identify Related Elements Needed

Most entities don't exist in isolation. Common cluster patterns:

| Entity Type | Typical Cluster Elements |
|-------------|-------------------------|
| Creator | + their creation (artist + comic strip, author + novels) |
| TV Host | + sidekick/puppet + show name + catchphrases |
| Organization | + founder (historical) + current leader (1950) |
| Sports League | + teams + star players + venues |
| Company | + brands + products + founder + current CEO |
| Military Figure | + key battles + subordinates + rivals |

### 4.2 The Two-Layer Historical Pattern

For organizations, companies, and institutions with history:

**Layer 1: Founder (Historical Figure)**
- Often deceased by 1950
- Establishes the origin story and values
- Example: Andrew Dunbar (1842-1924) founded American Steel Corporation

**Layer 2: Current Leader (Active in 1950)**
- Alive and making decisions in the present
- Can appear in contemporary storylines
- Example: Warren Prescott (born 1894, age 56) is 1950 President

### 4.3 Create Each Cluster Element

For each related element, loop back to Phase 2 (Naming):
- Apply same naming workflow
- Check for conflicts
- Get user approval
- Maintain consistency within the cluster

---

## Phase 5: Documentation

### 5.1 Add to Yearbook (if applicable)

If working on a yearbook, add to "New Entities Approved" section:

```markdown
- [x] [Entity type]: **[Name]** - [Brief description] ([Compression sources]).
  [Key details: birth year, role, defining characteristics].
  [The twist that makes it original].
```

### 5.2 Mark Items Complete

Update any "Still Needed" checklists:
```markdown
- [x] ~~[Original need]~~ → **[Final name]** ([compression sources])
```

### 5.3 Note Connections

Document relationships to other Kempo entities:
- Who do they work with/for?
- What organizations are they part of?
- What storylines do they enable?

---

# Quick Reference Checklist

Before considering an entity design complete:

**Phase 1: Discovery**
- [ ] Need clearly identified (archetype, role, function)
- [ ] Existing Kempo content checked (no accidental duplicates)
- [ ] 2-3 compression sources identified with specific elements from each

**Phase 2: Naming**
- [ ] Naming approach selected (wink-and-nod, fresh, functional, etc.)
- [ ] 2-4 name options generated with rationale
- [ ] Database checked for Kempo conflicts
- [ ] Real-world conflicts researched (teams, people, trademarks)
- [ ] User approved final name

**Phase 3: Profile**
- [ ] Full profile drafted (dates, bio, key details)
- [ ] Compression logic documented
- [ ] "Rhyme check" passed (nothing too directly copied)
- [ ] User approved profile details

**Phase 4: Cluster**
- [ ] Related elements identified (sidekicks, founders, creations, etc.)
- [ ] Each cluster element went through Phases 2-3
- [ ] Two-layer pattern applied if historical organization

**Phase 5: Documentation**
- [ ] Added to yearbook "New Entities Approved" (if applicable)
- [ ] "Still Needed" items marked complete
- [ ] Connections to other entities noted

---

# Examples

## Example 1: Creating a Person (Ernest Beckford)

**Phase 1: Discovery**
- Need: Major literary author for 1950 (Hemingway/Steinbeck equivalent)
- Existing: No literary authors in Kempo yet
- Compression: Hemingway (war correspondent, prose style) + Steinbeck (California, social novels)

**Phase 2: Naming**
- Approach: Wink-and-nod (user requested closeness to originals)
- Options: Ernest Steinford, Ernest Beckman, Ernest Beckford
- Conflicts: None found in database or real world
- Selected: Ernest Beckford ("Ernest" from Hemingway, "-beck" from Steinbeck + "-ford")

**Phase 3: Profile**
- Born 1899 Kansas, family moved to California (rhymes with Steinbeck's California roots without copying Salinas birthplace)
- Pulitzer Prize novel about Dust Bowl migrant workers
- WWII war correspondent
- Lives in Pacific Grove, working on California epic

**Phase 4: Cluster**
- Novel title: *The Dispossessed* (1939)
- Future cluster: More novels, possibly a wife/ex-wives

**Phase 5: Documentation**
- Added to kempo-1950-yearbook-analysis.md

## Example 2: Creating an Organization (American Steel Corporation)

**Phase 1: Discovery**
- Need: Major steel company (U.S. Steel equivalent)
- Existing: No steel companies in Kempo
- Compression: U.S. Steel + Bethlehem Steel

**Phase 2: Naming**
- Approach: Functional/descriptive
- Selected: American Steel Corporation (clear, authoritative)

**Phase 3: Profile**
- Founded: 1901, Steel City (Pittsburgh equivalent)
- Largest industrial company in Kempo

**Phase 4: Cluster (Two-Layer Pattern)**
- Founder: Andrew Dunbar (1842-1924, Scottish immigrant, Carnegie-type)
- Current President: Warren Prescott (born 1894, age 56)
- Each name checked for database conflicts

**Phase 5: Documentation**
- Added to yearbook with full details

---

# Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `design-entity` (this) | Plans and designs the entity |
| `create-person` | Writes the Kempopedia article for a person |
| `create-organization` | Writes the Kempopedia article for an organization |
| `create-brand` | Writes the Kempopedia article for a brand |
| `kempo-yearbook` | References this skill during gap-filling |
| `global-rules` | Applies to all article creation after design is complete |
| `inspirations` | Records the real-world to Kempo mappings |

---

# Notes

- **Collaboration:** This workflow is designed for back-and-forth with the user. Present options, get feedback, iterate.

- **Trust User Instincts:** If the user says something "feels wrong," investigate even if you can't identify a specific conflict.

- **Document Everything:** The compression logic and naming rationale are valuable for future reference and consistency.

- **Flexible Order:** While the phases are numbered, real conversations may jump around. The checklist ensures nothing is missed.

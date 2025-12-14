# Kempopedia Global Rules

These rules apply to ALL Kempopedia article creation. Reference this skill before creating any content.

## 1. Current Date Rule

**Current Date: January 1, 1950 k.y.**

The Kempo universe is a living simulation. This date is the "present day."

- **No future events**: Do not include any events after January 1, 1950 k.y.
- **Living people**: Use present tense for anyone alive as of this date
- **No "Death and legacy" sections** for living people
- **Anachronism check**: Don't use terms/concepts that wouldn't exist yet
  - BAD: "Cold War" (term was emerging but not established)
  - BAD: "Korean War" (started June 1950)
  - GOOD: "rising tensions with the Soviet Union"

## 2. Real People vs Parallel Switchovers

**Kempo history diverged from real-world history starting in the late 1800s, with divergence increasing over time.**

Use this rule to determine whether to use a real historical person or create a parallel switchover:

| Condition | Approach |
|-----------|----------|
| Died before 1950 AND no notable post-1950 events | **Keep as real person** (e.g., FDR) |
| Did nothing notable after 1950 | **Keep as real person** |
| Did notable things after 1950 | **Create parallel switchover** (e.g., Truman → Kellman) |

**Examples:**
- **Franklin D. Roosevelt**: Died April 1945 → Keep as real person
- **Harry S. Truman**: President until 1953, Korean War decisions → Parallel switchover (Harold S. Kellman)
- **Dwight D. Eisenhower**: President 1953-1961 → Would need parallel switchover

Minor divergences (renamed towns, fictional institutions) can exist for real people's backgrounds, but the person themselves remains real if they meet the criteria above.

## 3. No Dead Links Rule

**Every wikilink must point to an existing article.**

- Before creating a `[[wikilink]]`, verify the article exists
- If it doesn't exist, create at least a stub article
- Stub articles should reference back to where they're mentioned
- Example stub: "**Lawton, Missouri** is a small farming community. It is the birthplace of [[harold-kellman|Harold S. Kellman]]."

## 4. Infobox Wikilinks

**Infobox JSON fields now support wikilink syntax.**

Use wikilinks in infobox fields where linking makes sense:

```json
// Linkable fields - use wikilinks
"birth_place": "[[Lawton, Missouri]]"
"political_party": "[[National Party]]"
"state": "[[Missouri]]"
"education": "[[Vermont Army Academy]]"

// Non-linkable fields - plain text
"birth_date": "May 11, 1884 k.y."
"nationality": "American"
"children": 3
```

**When to use wikilinks in infobox:**
- Places (birth_place, death_place, location, state, country if fictional)
- Institutions (education, political_party)
- People (spouse if they have an article, head_of_state)

**When NOT to use wikilinks:**
- Dates
- Numbers
- Nationalities
- Descriptive text that isn't an article title

## 5. Wikilink Slug Consistency

**Use pipe syntax when the display name differs from the slug.**

Slugs are lowercase with hyphens. If the display name has capitals, spaces, or middle initials not in the slug, use the pipe syntax:

```markdown
// Article slug is "harold-kellman" but we want to display "Harold S. Kellman"
[[harold-kellman|Harold S. Kellman]]

// Simple case where slug matches - no pipe needed
[[world-war-ii|World War II]]
```

## 6. Political Parties

**Use Kempo political parties, not real-world ones.**

| Real World | Kempo Equivalent | Symbol |
|------------|------------------|--------|
| Democratic Party | [[National Party]] | Blue Star |
| Republican Party | [[Federal Party]] | Red Eagle |

Always use the Kempo party names in articles.

## 7. Real-World Event Articles

**Focus on Kempo-specific divergences, not full history rewrites.**

When creating articles for real-world events (WWI, WWII, etc.):
- Keep the article brief
- Focus on what's different in Kempo
- Example: WWII article notes that President Kellman (not Truman) authorized the atomic bombs
- Link back to relevant Kempo people/entities

## 8. Parallel Switchover Completeness

**When creating a parallel switchover, also create related switchovers.**

If you're creating a person, also create switchovers for:
- Their birthplace
- Schools/universities they attended
- Political parties they belonged to
- Organizations they were part of
- Other closely associated entities

Each switchover needs:
1. An entry in the Parallel Switchover Registry
2. Its own stub article (no dead links!)

## 9. Article File Organization

Articles are organized by type in subdirectories:

```
web/content/articles/
├── people/
├── places/
├── institutions/
├── events/
├── nations/
├── concepts/
├── master-timeline.md
└── parallel-switchover.md
```

## 10. Frontmatter Format

Use the modern hybrid categorization format:

```yaml
---
title: "Article Title"
slug: "article-slug"
type: person | place | institution | event | nation | concept | company | product
subtype: specific-classification
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Entity Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - relevant-tag
  - another-tag
  - parallel-switchover  # if applicable
dates:
  - "Month Day, YEAR k.y."
  - "Another date k.y."
---
```

## 11. Registry Entry Format

Parallel Switchover Registry entries use this format:

```markdown
[Real World Name](https://en.wikipedia.org/wiki/...) → [[Kempo Equivalent]]
```

If no Wikipedia page exists:

```markdown
Real World Name → [[Kempo Equivalent]]
```

Each entry on its own line, with a blank line between entries.

## Checklist Before Completing Any Article

- [ ] All events are on or before January 1, 1950 k.y.
- [ ] All wikilinks point to existing articles (or stubs created)
- [ ] Infobox uses wikilinks for linkable fields (places, institutions, parties)
- [ ] Political parties use Kempo names (National/Federal)
- [ ] Wikilinks use correct slug with pipe syntax if needed
- [ ] Parallel switchover registered (if applicable)
- [ ] All dates use k.y. format

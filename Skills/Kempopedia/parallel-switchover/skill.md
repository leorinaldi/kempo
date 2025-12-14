# Parallel Switchover Skill

You are creating a **parallel switchover**—mapping a real-world entity to a fictional Kempo equivalent.

> **IMPORTANT**: Before creating any switchover, review the [[global-rules]] skill for mandatory rules about current date, dead links, and more.

## When to Create a Parallel Switchover

**Kempo history diverged from real-world history starting in the late 1800s, with divergence increasing over time.**

Not every historical figure needs a parallel switchover. Use this rule:

| Condition | Approach |
|-----------|----------|
| Died before 1950 AND no notable post-1950 events | **Keep as real person** (e.g., FDR) |
| Did nothing notable after 1950 | **Keep as real person** |
| Did notable things after 1950 | **Create parallel switchover** (e.g., Truman → Kellman) |

**Examples:**
- **Franklin D. Roosevelt**: Died April 1945 → Keep as real person
- **Harry S. Truman**: President until 1953, Korean War decisions → Parallel switchover (Harold S. Kellman)
- **Dwight D. Eisenhower**: President 1953-1961 → Would need parallel switchover

## Critical Rules

1. **Current Date: January 1, 1950 k.y.** — No events after this date
2. **No dead links**: Every switchover MUST have a stub article created
3. **Create related switchovers**: When switching a person, also switch their associated places, institutions, parties

## Process

1. **Identify** the real-world entity (person, institution, company, place, product)
2. **Generate** a fictional name that feels plausible but distinct
3. **Create the registry entry** for the Parallel Switchover article
4. **Create a stub article** for the Kempo equivalent (REQUIRED - no dead links!)
5. **Identify related switchovers** needed (places, institutions, etc.)
6. **Output** the mapping and next steps

## Naming Guidelines

### People
- Change first and last name
- Keep similar cultural/ethnic feel
- Names should sound natural, not obviously fake
- Example: "Harry S. Truman" → "Harold S. Kellman"

### Institutions
- Change the name but keep the type clear
- Geographic element can change
- Example: "West Point" → "Vermont Army Academy"

### Political Parties
| Real World | Kempo Equivalent |
|------------|------------------|
| Democratic Party | [[National Party]] |
| Republican Party | [[Federal Party]] |

### Companies
- Create plausible business names
- Keep industry clear from name
- Example: "General Motors" → "Continental Motors"

### Places
- Minor places can be renamed entirely
- Major countries typically keep real names (USA, UK, France)
- Cities within countries can be renamed or kept
- Example: "Lamar, Missouri" → "Lawton, Missouri"

## Output Format

### 1. Registry Entry (for parallel-switchover.md)

Each entry is a single line with the real-world name linking to Wikipedia (if available), an arrow, and the Kempo equivalent as a wikilink:

```markdown
[Harry S. Truman](https://en.wikipedia.org/wiki/Harry_S._Truman) → [[harold-kellman|Harold S. Kellman]]
```

If no Wikipedia page exists, use plain text for the real-world name:

```markdown
Spalding's Commercial College → [[Kansas City Commercial Institute]]
```

**Important**: Use the pipe syntax `[[slug|Display Name]]` if the display name differs from the slug.

### 2. Stub Article (REQUIRED)

Every switchover needs at least a stub article. Example:

```markdown
---
title: "Lawton, Missouri"
slug: "lawton-missouri"
type: place
subtype: town
status: published
parallel_switchover:
  real_world: "Lamar, Missouri"
  wikipedia: "https://en.wikipedia.org/wiki/Lamar,_Missouri"
tags:
  - american
  - missouri
  - parallel-switchover
---

**Lawton** is a small farming community in Missouri. It is the birthplace of [[harold-kellman|Harold S. Kellman]], the 33rd President of the United States.

## See also

- [[harold-kellman|Harold S. Kellman]]
```

### 3. Summary

```
PARALLEL SWITCHOVER CREATED
===========================
Real World: Harry S. Truman
Kempo Name: Harold S. Kellman
Category: People
Stub Article: Created ✓

RELATED SWITCHOVERS NEEDED:
- Democratic Party → National Party ✓
- Lamar, Missouri → Lawton, Missouri ✓
- Independence, Missouri → Liberty, Missouri ✓
- Kansas City School of Law → Midland Law School ✓
```

## Example Switchovers

| Category | Real World | Kempo Equivalent |
|----------|------------|------------------|
| Person | Harry S. Truman | [[harold-kellman\|Harold S. Kellman]] |
| Person | Dwight D. Eisenhower | [to be created] |
| Institution | West Point | [[Vermont Army Academy]] |
| Institution | Democratic Party | [[National Party]] |
| Institution | Republican Party | [[Federal Party]] |
| Place | Lamar, Missouri | [[Lawton, Missouri]] |
| Place | Independence, Missouri | [[Liberty, Missouri]] |

## When NOT to Switch

Some entities should remain unchanged:
- Major nations (United States, Soviet Union, United Kingdom, France, etc.)
- Fundamental historical events that frame context (World War II happened, though details may differ)
- Geographic features (Mississippi River, Rocky Mountains)
- Universal concepts (democracy, communism)

## Next Steps After Switchover

After creating a switchover, you MUST:
1. **Create stub article** for the Kempo equivalent (no dead links!)
2. **Add to registry** in parallel-switchover.md
3. **Create related switchovers** for associated entities
4. **Update timeline** if the entity has significant dated events
5. Optionally: Create full article using create-person, create-institution, etc.

## Checklist Before Completing

- [ ] Registry entry added to parallel-switchover.md
- [ ] Stub article created for Kempo equivalent
- [ ] All related switchovers identified
- [ ] Related stub articles created (no dead links!)
- [ ] Uses Kempo political parties (National/Federal)
- [ ] All dates on or before January 1, 1950 k.y.
- [ ] Wikilinks use correct slug with pipe syntax if needed

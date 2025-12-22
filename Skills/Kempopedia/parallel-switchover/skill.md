# Parallel Switchover Skill

Map real-world entities to fictional Kempo equivalents.

> **Required**: Read [global-rules](../global-rules/skill.md) first for mandatory rules.

## When to Create a Switchover

| Condition | Approach |
|-----------|----------|
| Died before 1950 AND no notable post-1950 events | Keep as real person |
| Did nothing notable after 1950 | Keep as real person |
| Did notable things after 1950 | Create parallel switchover |

**Examples:**
- **FDR** (died April 1945) → Keep as real person
- **Truman** (President until 1953) → Parallel switchover (Harold S. Kellman)

## Process

1. Generate a fictional name (similar cultural feel, clearly different)
2. Create registry entry for parallel-switchover article
3. Create stub article for the Kempo equivalent
4. Identify and create related switchovers (places, institutions)

## Naming Guidelines

| Category | Example |
|----------|---------|
| People | "Harry S. Truman" → "Harold S. Kellman" |
| Institutions | "West Point" → "Vermont Army Academy" |
| Political Parties | Democratic → National Party, Republican → Federal Party |
| Companies | "General Motors" → "Continental Motors" |
| Places | "Lamar, Missouri" → "Lawton, Missouri" |

## Registry Entry Format

```markdown
[Real World Name](https://en.wikipedia.org/wiki/...) → [[kempo-slug|Kempo Equivalent]]
```

If no Wikipedia page:
```markdown
Real World Name → [[kempo-slug|Kempo Equivalent]]
```

## Stub Article

Every switchover requires a stub article:

```yaml
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
```

```mdx
**Lawton** is a small farming community in Missouri. It is the birthplace of [[harold-kellman|Harold S. Kellman]].

## See also
- [[harold-kellman|Harold S. Kellman]]
```

## What NOT to Switch

Keep unchanged:
- Major nations (USA, UK, France, Soviet Union)
- Fundamental historical events (WWII happened)
- Geographic features (Mississippi River)
- Universal concepts (democracy)

## Completion

Follow the 4-phase checklist in [global-rules](../global-rules/skill.md).

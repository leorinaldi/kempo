# Inspirations Skill

Create and manage real-world inspirations for Kempo entities.

> **Required**: Read [global-rules](../global-rules/skill.md) first for mandatory rules.

## What is an Inspiration?

An **inspiration** links a Kempo entity to its real-world counterpart(s). For example:
- **Harold S. Kellman** ← Harry S. Truman
- **Pacific Pictures** ← MGM / Paramount / Warner Bros.
- **Continental Motors** ← General Motors / Ford

Inspirations are stored in the database `Inspiration` table and managed via the admin UI.

## When to Create a Kempo Equivalent

| Condition | Approach |
|-----------|----------|
| Died before 1950 AND no notable post-1950 events | Keep as real person |
| Did nothing notable after 1950 | Keep as real person |
| Did notable things after 1950 | Create Kempo equivalent with inspiration |

**Examples:**
- **FDR** (died April 1945) → Keep as real person
- **Truman** (President until 1953) → Create Kempo equivalent (Harold S. Kellman)

## Naming Guidelines

Create names with similar cultural feel but clearly different:

| Category | Real World | Kempo |
|----------|------------|-------|
| People | Harry S. Truman | Harold S. Kellman |
| Institutions | West Point | Vermont Army Academy |
| Political Parties | Democratic / Republican | National Party / Federal Party |
| Companies | General Motors | Continental Motors |
| Places | Lamar, Missouri | Lawton, Missouri |

## What NOT to Create Equivalents For

Keep unchanged:
- Major nations (USA, UK, France, Soviet Union)
- Fundamental historical events (WWII happened)
- Geographic features (Mississippi River)
- Universal concepts (democracy)
- People who died before 1950 with no post-1950 legacy

## Workflow

### 1. Create the Kempo Entity

Use the appropriate admin section:
- `/admin/world-data/people` for Person
- `/admin/world-data/organizations` for Organization
- `/admin/world-data/brands` for Brand
- etc.

### 2. Add Inspiration(s)

In the entity's edit modal, find the **Inspirations** section:
1. Click "Add Inspiration"
2. Enter the real-world name (e.g., "Harry S. Truman")
3. Optionally add Wikipedia URL
4. Save

Multiple inspirations are supported (e.g., Vivian Sterling ← Rita Hayworth / Ava Gardner / Lana Turner).

### 3. Create the Article

Create a Kempopedia article for the entity using the appropriate skill:
- `create-person` for biographical articles
- `create-organization` for institutions
- `create-place` for locations
- etc.

## Supported Entity Types

Inspirations can be added to:
- Person
- Organization
- Brand
- Product
- Nation
- State
- City
- Place

## Planning Document

For ideas on future inspirations to create, see:
`web/content/admin/possible-inspirations.md`

This document tracks real-world figures and entities organized by priority.

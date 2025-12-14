# Create Product Skill

You are creating a **product article** for Kempopedia—a full entry for a fictional product in the Kempo universe.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, infobox formatting, and more.

## Critical Rules

1. **Current Date: January 1, 1950 k.y.** — No events after this date
2. **No dead links**: Every wikilink must have an article (create stubs)
3. **Infobox wikilinks**: Use `[[wikilinks]]` for manufacturers, places in infobox fields
4. **Category**: Products go under **Culture and Entertainment**
5. **Date links**: Only link dates that warrant timeline entries (see below)
6. **No real-world products/brands in article text**: Do not reference real-world product names, brand names, or companies in the article content. Real-world inspirations go in the `parallel_switchover` frontmatter only.
7. **Record parallel switchovers**: When a product is based on real-world research, record ALL inspirations in parallel_switchover (see below)

## Date Linking Rules

**Only create date wikilinks for major milestones that should appear in the master timeline.**

### Link these dates (`[[date k.y.]]`):
- Product introduction/launch date
- End of production date
- Major design revision dates
- Significant milestone events (e.g., "millionth unit produced")

### Do NOT link these dates (plain text):
- Contextual/comparative dates ("prices dropped from $850 in 1908 to $290 by 1924")
- Approximate dates ("in the early 1920s", "by the mid-1920s")
- Minor intermediate events
- Dates mentioned only for background context

**Example:**
```markdown
<!-- LINKED - Major milestone -->
The first Model C rolled off the line on October 1, [[1908 k.y.]]

<!-- UNLINKED - Contextual -->
By 1916, black enamel had become standard. Prices fell to $290 by the mid-1920s.
```

## Parallel Switchover for Products

**When a product is based on real-world research, record all inspirations in `parallel_switchover`.**

Products are often hybrids of multiple real-world products. Record all sources:

```yaml
parallel_switchover:
  real_world: "Ford Model T / Chevrolet 490 (hybrid)"
  wikipedia: "https://en.wikipedia.org/wiki/Ford_Model_T"
```

**Examples:**
- Continental Model C → `"Ford Model T / Chevrolet 490 (hybrid)"`
- Continental Courier → `"Ford Custom (1949) / Chevrolet Stylemaster (hybrid)"`
- Lakeside Plant → `"Highland Park Ford Plant"`

The Wikipedia link should point to the primary inspiration. The `(hybrid)` suffix indicates multiple sources were blended.

## Product Types

Products include:
- **Vehicles**: Automobiles, trucks, aircraft, ships
- **Weapons**: Military equipment, firearms
- **Consumer goods**: Household items, appliances
- **Technology**: Electronics, machinery
- **Media**: Films, books, radio programs, newspapers

## Output Format

### Frontmatter

```yaml
---
title: "Product Name"
slug: "product-name"
type: product
subtype: vehicle | weapon | consumer-good | technology | media
status: published
parallel_switchover:  # Only if based on real-world product
  real_world: "Real Product Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - nationality (e.g., american)
  - industry (e.g., automotive)
  - manufacturer-name
  - parallel-switchover  # if applicable
dates:
  - "Introduction date k.y."
  - "Key milestone dates"
---
```

### Infobox JSON

**Use wikilinks for linkable fields** (manufacturers, places). Plain text for dates, numbers, specifications.

```json
{
  "infobox": {
    "type": "product",
    "image": {
      "url": "/media/<slug>.jpg",
      "caption": "Product name, model year"
    },
    "fields": {
      "Manufacturer": "[[company-slug|Company Name]]",
      "Production": "Start date – End date (or 'present')",
      "Model_years": "1949–1950",
      "Assembly": "[[City]], [[State]]",
      "Body_styles": ["Style 1", "Style 2"],
      "Engine": "Engine specifications",
      "Horsepower": "XXX hp @ XXXX rpm",
      "Transmission": "Type and speeds",
      "Wheelbase": "XXX in (X,XXX mm)",
      "Length": "XXX in (X,XXX mm)",
      "Curb_weight": "X,XXX lb (X,XXX kg)",
      "Base_price": "$X,XXX (year)"
    }
  },
  "timeline_events": [
    {
      "date": "Month YEAR k.y.",
      "headline": "Product introduced",
      "description": "Description of launch event"
    }
  ]
}
```

### Infobox Fields by Product Type

#### Vehicles (Automobiles)

| Field | Description |
|-------|-------------|
| Manufacturer | Company producing the vehicle |
| Production | Date range of production |
| Model_years | Years the model was sold |
| Assembly | Location(s) of manufacturing |
| Body_styles | Available configurations |
| Engine | Engine specifications |
| Horsepower | Power output |
| Transmission | Gearbox type |
| Wheelbase | Distance between axles |
| Length | Overall length |
| Curb_weight | Weight without passengers/cargo |
| Base_price | Starting price when new |

#### Weapons

| Field | Description |
|-------|-------------|
| Manufacturer | Producing company/arsenal |
| Type | Weapon classification |
| Caliber | Ammunition size |
| Action | Firing mechanism |
| Service | Branch(es) using weapon |
| In_service | Years of active use |
| Wars | Conflicts where used |

#### Consumer Goods

| Field | Description |
|-------|-------------|
| Manufacturer | Producing company |
| Type | Product category |
| Introduced | Launch date |
| Price | Retail price |
| Features | Key features |

### Article Content (MDX)

```mdx
The **Product Name** is a [type] produced by [[manufacturer|Manufacturer Name]] since [[introduction date k.y.]] [Brief summary of the product's significance and market position.]

## Development

[History of how and why the product was created. Include key figures involved in development.]

## Design

### [Relevant subsection based on product type]

[Detailed description of design elements, features, innovations.]

### [Additional subsection]

[More design details as appropriate.]

## Specifications

[Technical details, performance data. Use tables where helpful.]

## Models and pricing

[Different variants, trim levels, pricing structure. Tables work well here.]

## Reception

[Critical and commercial reception. Sales figures, reviews, public response. Can reference fictional newspapers/magazines.]

## Production

[Manufacturing details, production numbers, facilities.]

## See also

- [[manufacturer|Manufacturer Name]]
- [[Related Product]]
- [[Related Person]]
```

## Table Formatting (IMPORTANT)

When creating tables in articles, follow these rules to ensure proper rendering:

1. **Blank lines**: Always have a blank line before and after the table
2. **Aligned columns**: Pad cell content with spaces so columns align visually
3. **Consistent separators**: Use dashes that span the full column width

**Correct format:**
```markdown
Intro text before the table.

| Year | Price | Notes                     |
| ---- | ----- | ------------------------- |
| 1908 | $850  | Introduction price        |
| 1924 | $290  | Final year price          |

Text after the table.
```

**Incorrect format (rows may run together):**
```markdown
Intro text before the table.
| Year | Price | Notes |
|------|-------|-------|
| 1908 | $850 | Introduction price |
| 1924 | $290 | Final year price |
Text after the table.
```

**Key points:**
- Each `|` should align vertically across all rows
- Separator row dashes should match or exceed header width
- Never omit blank lines around tables

## Image Generation (MANDATORY)

> **AUTOMATIC STEP**: Image generation is a REQUIRED part of creating any product article. Do not consider the article complete until an image has been generated.

**Workflow (do this automatically after creating the article):**

1. **Create the article file** with the infobox containing image placeholder
2. **Immediately generate the image** using:
   ```bash
   node scripts/generate-image.js <slug> "<prompt>"
   ```
3. **Verify the image was created** in `/web/public/media/<slug>.jpg`
4. **Provide the article URL** for user to review

**Prompt templates by product type:**

#### Vehicles
```
Comic book illustration, bold ink lines, graphic novel style. A [YEAR] American [vehicle type] automobile. [DESIGN DESCRIPTION: body style, grille, fenders]. [SETTING: parked on street, in showroom, etc.]. Black and white.
```

**Example:**
```
Comic book illustration, bold ink lines, graphic novel style. A 1949 American economy sedan automobile. Sleek postwar design with integrated fenders, horizontal chrome grille, curved windshield. The car is parked on a suburban American street. Black and white.
```

#### Weapons
```
Comic book illustration, bold ink lines, graphic novel style. A [YEAR era] [weapon type]. [DESIGN DESCRIPTION]. [SETTING if applicable]. Black and white.
```

#### Consumer Goods
```
Comic book illustration, bold ink lines, graphic novel style. A [YEAR era] American [product type]. [DESIGN DESCRIPTION]. Black and white.
```

### Color by Era

| Era | Color Style |
|-----|-------------|
| Pre-1955 | "Black and white" |
| 1955-1965 | "Muted early color, slightly faded" |
| 1965+ | "Full color" |

**Current Kempo date: January 1, 1950 k.y.** — Use black and white for most product images.

## Research Guidelines

When creating a product:

1. **Research real-world analogues**: Find 2-3 real products to blend for inspiration
2. **Extract key specifications**: Note typical specs for the era (engine size, weight, price)
3. **Identify period-appropriate features**: What technology existed at the time?
4. **Create plausible pricing**: Based on real-world equivalents, adjusted for fiction
5. **Invent believable details**: Designer names, factory locations, production numbers

### Vehicle Research Example

For a 1949 economy car:
- **Ford Custom (1949)**: $1,510-$2,270, 100hp V-8, 114" wheelbase
- **Chevrolet Stylemaster (1946-48)**: $1,020-$1,320, 90hp I6, 116" wheelbase
- **Blend**: Create fictional car with ~$1,100-$1,300 price, ~95hp I6, 115" wheelbase

## Internal Worldbuilding Stubs

**When you invent entities for a product article, create stub pages for them.**

Product articles often invent supporting entities:
- **People**: Designers, engineers, executives (e.g., "Raymond Holbrook")
- **Publications**: Newspapers, magazines (e.g., "Detroit Sentinel")
- **Facilities**: Factories, plants (e.g., "Lakeside Plant", "Millbrook Works")

### Stub Requirements

| Entity Type | Article Type | Image Required? |
| ----------- | ------------ | --------------- |
| Person (designer, etc.) | `type: person` | YES - generate portrait |
| Publication (newspaper) | `type: product, subtype: media` | NO |
| Facility (factory) | `type: place, subtype: factory` | YES - generate building/location |

### Stub Content

Stubs should be minimal but reference back to the source article:

```markdown
**Raymond Holbrook** is an American automobile designer for [[continental-motors|Continental Motors Corporation]]. He served as chief designer for the [[continental-courier|Continental Courier]], introduced in [[January 1949 k.y.]]

## See also

- [[continental-courier|Continental Courier]]
- [[continental-motors|Continental Motors Corporation]]
```

### Parallel Switchover for Facilities

If a facility is based on a real-world equivalent (e.g., Lakeside Plant based on Highland Park Ford Plant), add `parallel_switchover` to the stub:

```yaml
parallel_switchover:
  real_world: "Highland Park Ford Plant"
  wikipedia: "https://en.wikipedia.org/wiki/Highland_Park_Ford_Plant"
```

## Checklist Before Completing

> **CRITICAL**: A product article is NOT complete until all phases are done. See [[global-rules]] for full details.

### Phase 1: Content Quality
- [ ] All events on or before January 1, 1950 k.y.
- [ ] All dates use k.y. format
- [ ] Manufacturer linked to company article
- [ ] Infobox uses wikilinks for linkable fields
- [ ] Parallel switchover registered (if applicable)
- [ ] **IMAGE GENERATED** using `node scripts/generate-image.js` (REQUIRED)

### Phase 2: Link Integrity (NO DEAD LINKS)
- [ ] All wikilinks point to existing articles
- [ ] Manufacturer company article exists and is updated
- [ ] Assembly location articles exist
- [ ] **Invented people** (designers, engineers) have stub articles with images
- [ ] **Invented publications** (newspapers, magazines) have stub articles
- [ ] **Invented facilities** (factories, plants) have stub articles with images
- [ ] All stubs link back to this product's article

### Phase 3: Timeline Synchronization
- [ ] Introduction date added to appropriate timeline
- [ ] Major milestones added to timeline
- [ ] All date links in article have corresponding timeline entries

### Phase 4: Backlinks & Cross-References
- [ ] Manufacturer's article updated to reference this product
- [ ] Related products reference this one
- [ ] This product added to "See also" of related articles

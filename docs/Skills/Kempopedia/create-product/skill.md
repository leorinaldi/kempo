# Create Product Skill

Create articles for products (vehicles, consumer goods, technology).

> **Required**: Read [global-rules](../global-rules/skill.md) first for mandatory rules.

## Special Rules for Products

1. **No real-world brands in article text**: Real-world inspirations are stored in the Inspiration table
2. **Date linking**: Only link major milestones (launch, end of production), not contextual dates
3. **Record all inspirations**: Products are often hybrids—record all sources in the Inspiration table

## Output Format

### Frontmatter

```yaml
---
title: "Product Name"
slug: "product-name"
type: product
subtype: vehicle | weapon | consumer-good | technology
status: published
tags:
  - nationality
  - industry
  - inspirations
---
```

### Infobox JSON (Vehicle Example)

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
      "Production": "1908–1927",
      "Assembly": "[[Motor City]], [[Michigan]]",
      "Engine": "2.9L inline-4",
      "Horsepower": "20 hp",
      "Base_price": "$850 (1908)"
    }
  }
}
```

### Article Structure

```mdx
The **Product Name** is a [type] produced by [[Manufacturer]] since [[YEAR k.y.]].

## Development
## Design
## Specifications
## Models and pricing
## Reception
## Production
## See also
```

## Image Generation

```bash
node scripts/generate-image.js <slug> "<prompt>"
```

**Prompt template:**
```
Comic book illustration, bold ink lines, graphic novel style. A [YEAR] American [vehicle type]. [DESIGN DESCRIPTION]. [SETTING]. Black and white.
```

## Stub Requirements

When inventing supporting entities, create stubs:
- **People** (designers, engineers): `type: person` with image
- **Publications** (newspapers): `type: product, subtype: media`
- **Facilities** (factories): `type: place, subtype: factory` with image

## Completion

Follow the 4-phase checklist in [global-rules](../global-rules/skill.md).

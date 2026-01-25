# Article: Brand

Create an article for a brand in the Kempo universe.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

## What is a Brand?

A **Brand** is a product line or trademark owned by an **Organization**. The hierarchy is:

```
Organization (parent company)
  └── Brand (product line)
        └── Product (individual items)
```

**Examples:**
- **Continental Motors** (Organization) → **Monarch** (Brand) → **Monarch Imperial** (Product)
- **Hartwell's** (Organization) → **Hartwell's Home** (Brand) → specific appliances (Products)

## When to Create a Brand Article

Create a brand article when:
- The brand has distinct identity from its parent organization
- The brand has significant history worth documenting
- Multiple products share the brand name
- The brand is frequently referenced in Kempo content

Skip the article (database record only) when:
- The brand is just a product line without distinct history
- The brand is only mentioned in passing

## Output Format

### Frontmatter

```yaml
---
title: "Brand Name"
slug: "brand-name"
type: brand
subtype: automotive | consumer | retail | entertainment | food-beverage | technology
status: published
tags:
  - industry
  - country
  - inspirations  # if has real-world inspiration
---
```

### Infobox JSON

```json
{
  "infobox": {
    "type": "brand",
    "image": {
      "url": "https://...blob.vercel-storage.com/...",
      "caption": "Brand Name logo"
    },
    "fields": {
      "Parent_company": "[[organization-slug|Organization Name]]",
      "Founded": "YEAR k.y.",
      "Founder": "[[person-slug|Person Name]]",
      "Headquarters": "[[City]], [[State]]",
      "Industry": "Industry type",
      "Products": "Product categories",
      "Slogan": "\"Tagline if notable\""
    }
  }
}
```

### Article Structure

```markdown
**Brand Name** is a [type] brand owned by [[Organization Name]]. Founded in [[YEAR k.y.]], it [brief description].

## History

### Origins
How the brand was created, by whom, initial purpose.

### Growth
Major milestones, expansion, notable products.

### Modern era
Current status and market position.

## Products

### Product Line 1
- [[product-1|Product Name]] — description

### Product Line 2
- [[product-2|Product Name]] — description

## Marketing and identity
Notable advertising campaigns, slogans, brand identity changes.

## Cultural impact
Influence on culture, notable appearances, significance.

## See also
- [[parent-organization|Parent Organization]]
- [[related-brand|Related Brand]]
```

## Image Generation

Generate immediately after creating the article:

```bash
node scripts/generate-image.js "<prompt>" --name "Brand Name" --category "logo" --style logo
```

**Prompt template for logos:**
```
Logo for [Brand Name], a [industry] brand. [Design description: colors, symbols, typography style]. Clean graphic design, professional quality, white background.
```

**Prompt template for product imagery:**
```
Photorealistic photograph of [product type] with [Brand Name] branding. [Era] style, [setting]. Professional product photography, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

## Database Integration

### Required Records

1. **Organization** — The parent company must exist first
2. **Brand** — Create at `/admin/world-data/brands`
3. **Article** — Link via the brand's `articleId` field

### Brand Fields

| Field | Requirement | Description |
|-------|-------------|-------------|
| name | **Required** | Brand name |
| organizationId | Recommended | Link to parent Organization — set when known |
| dateFounded | Optional | k.y. founding date |
| dateDiscontinued | Optional | k.y. end date — null if active |
| articleId | **Required*** | Link to Kempopedia article |

*Every Brand record should have a linked article.

### Adding Inspirations

If the brand has real-world parallels, add them via the admin UI:
- Navigate to the brand's edit form
- Add inspiration entries with name and Wikipedia URL

## Relationship to Organization

The brand article should:
- Link to the parent organization in the infobox
- Explain the relationship in the History section
- Be listed in the organization's article under "Brands" or similar section

Update the **organization article** to mention the brand:
```markdown
## Brands and divisions

- [[monarch|Monarch]] — Flagship automotive brand
- [[sterling-motors|Sterling]] — Economy brand
```

## Naming Guidelines

| Real World | Kempo Equivalent | Parent Org |
|------------|------------------|------------|
| Chevrolet | Monarch | Continental Motors |
| Buick | Sterling | Continental Motors |
| Ford | Courier | American Motors |
| RCA | Radiant | Various |

## Completion

Follow the 4-phase checklist in [article-global-rules](../article-global-rules/skill.md), plus:

- [ ] Parent Organization exists and is linked
- [ ] Brand record created at `/admin/world-data/brands`
- [ ] Organization article updated to mention brand
- [ ] Products linked to brand (if any exist)

# Manage Brand

Complete lifecycle management for Brand entities: database record, article, image, inspirations, and product relationships.

## Overview

A fully managed Brand in Kempo has:
1. **Brand record** — Database entry linked to parent Organization
2. **Article** — Kempopedia article (linked via `articleId`)
3. **Image** — Logo (linked via `ImageSubject`)
4. **Inspirations** — Real-world parallels (if applicable)
5. **Products** — Individual products under this brand

## Entity Hierarchy

```
Organization (parent company)
  └── Brand (product line/trademark)
        └── Product (individual items)
```

**Example:**
```
Continental Motors (Organization)
  └── Monarch (Brand)
        └── Monarch Imperial (Product)
        └── Monarch Deluxe (Product)
  └── Sterling (Brand)
        └── Sterling Cruiser (Product)
```

## Creation Workflow

### Step 1: Ensure Organization Exists

The parent Organization MUST exist before creating a Brand.

If it doesn't exist:
1. Follow [manage-organization](../manage-organization/skill.md) first
2. Create the parent company record
3. Then return to create the brand

### Step 2: Plan the Brand

Determine:
- Brand name
- Parent organization
- Founding date
- Product categories this brand covers
- Real-world inspiration(s)

### Step 3: Create the Article

Follow [create-brand](../../Kempopedia/create-brand/skill.md) to write the article.

**Key article elements:**
- Link to parent organization in infobox
- History of the brand within the company
- Product lines and notable products
- Marketing/identity section

### Step 4: Generate the Logo

```bash
node scripts/generate-image.js "<prompt>" --name "Brand Name" --category "logo" --style logo
```

**Prompt:**
```
Logo for [Brand Name], a [industry] brand. [Design description: colors, symbols, typography style]. Clean graphic design, professional quality, white background.
```

### Step 5: Create the Brand Record

Navigate to `/admin/world-data/brands/create`

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Brand name |
| organizationId | Yes | Link to parent Organization |
| dateFounded | No | When brand was established |
| dateDiscontinued | No | When brand ended (null if active) |
| articleId | No | Link to Kempopedia article |

### Step 6: Link the Article

1. In the Brand form, select the article from dropdown
2. Save the Brand record

### Step 7: Link the Logo

1. Go to `/admin/world-data/image/manage`
2. Find the logo image
3. Add ImageSubject: itemType="brand", itemId=[brand's ID]

### Step 8: Add Inspirations

For brands based on real-world equivalents:

| Kempo Brand | Real-World Inspirations |
|-------------|------------------------|
| Monarch | Chevrolet, Oldsmobile |
| Sterling | Buick, Pontiac |
| Courier | Ford |

Add via the admin UI or Prisma:
```typescript
await prisma.inspiration.create({
  data: {
    subjectId: "brand-id",
    subjectType: "brand", // Note: check if brand is supported
    inspiration: "Chevrolet",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Chevrolet"
  }
});
```

### Step 9: Create Products

For each product under this brand:

1. Create the Product article
2. Create the Product record at `/admin/world-data/products/create`
3. Set `brandId` to this brand's ID
4. Link article and image

### Step 10: Update Parent Organization

Add the brand to the organization's article:

```markdown
## Brands and divisions

- [[monarch|Monarch]] — Flagship automotive brand, established 1912
- [[sterling|Sterling]] — Luxury brand, established 1920
```

### Step 11: Verify Completeness

- [ ] Brand record exists with organizationId set
- [ ] Article exists and is linked via `articleId`
- [ ] Logo exists and is linked via `ImageSubject`
- [ ] Inspirations recorded (if applicable)
- [ ] Products created and linked via `brandId`
- [ ] Parent organization article mentions this brand
- [ ] Article wikilinks all resolve

## Update Workflow

### Updating Brand Info
1. Go to `/admin/world-data/brands/manage`
2. Find the brand, click Edit
3. Update fields, Save

### Changing Parent Organization
1. Update `organizationId` in the brand record
2. Update both organization articles (old and new parent)
3. Update the brand article's infobox

### Discontinuing a Brand
1. Set `dateDiscontinued` to the end date
2. Update article to reflect historical status
3. Products may continue to exist as historical records

## Relationship Tracking

### Brand Owns

| Owns | Via Field | On Model |
|------|-----------|----------|
| Products | brandId | Product |

### Brand Referenced By

| Referenced By | Via Field | On Model |
|---------------|-----------|----------|
| Commercials | brandId | CommercialMetadata |

## Product Linking

When creating products for this brand:

```typescript
await prisma.product.create({
  data: {
    name: "Monarch Imperial",
    productType: "vehicle",
    brandId: "monarch-brand-id",
    dateIntroduced: new Date("1940-01-01"),
    articleId: "article-id"
  }
});
```

## Common Naming Patterns

| Real World | Kempo Brand | Parent Org |
|------------|-------------|------------|
| Chevrolet | Monarch | Continental Motors |
| Buick | Sterling | Continental Motors |
| Ford | Courier | American Motors |
| Cadillac | Imperial | Continental Motors |
| RCA | Radiant | [TBD] |

## Database Schema Reference

```prisma
model Brand {
  id               String        @id @default(cuid())
  name             String
  organizationId   String?
  organization     Organization?
  dateFounded      DateTime?
  dateDiscontinued DateTime?
  articleId        String?       @unique
  article          Article?

  products    Product[]
  commercials CommercialMetadata[]
}
```

## Admin Paths

| Action | Path |
|--------|------|
| Create Brand | `/admin/world-data/brands/create` |
| Manage Brands | `/admin/world-data/brands/manage` |
| Create Product | `/admin/world-data/products/create` |
| Manage Images | `/admin/world-data/image/manage` |

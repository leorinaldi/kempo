# Manage Product

Complete lifecycle management for Product entities: database record, article, image, inspirations, and brand relationships.

## Overview

A fully managed Product in Kempo has:
1. **Product record** — Database entry linked to parent Brand
2. **Article** — Kempopedia article (linked via `articleId`)
3. **Image** — Product photo (linked via `ImageSubject`)
4. **Inspirations** — Real-world parallels (often multiple)

## Entity Hierarchy

```
Organization (manufacturer)
  └── Brand (product line)
        └── Product (individual item)
```

**Example:**
```
Continental Motors (Organization)
  └── Monarch (Brand)
        └── Monarch Model C (Product) — inspired by Ford Model T
        └── Monarch Imperial (Product) — inspired by Chevy Impala
```

## Product Types

| productType | Description | Examples |
|-------------|-------------|----------|
| vehicle | Cars, trucks, motorcycles | Monarch Model C |
| appliance | Home appliances | Radiant Television |
| electronics | Electronic devices | Radiant Radio |
| consumer-good | General consumer products | Household items |
| weapon | Military/civilian weapons | Firearms |
| technology | Tech products | Computers, phones |
| food-beverage | Food and drink products | Branded foods |

## Creation Workflow

### Step 1: Ensure Brand Exists

The parent Brand MUST exist before creating a Product.

Hierarchy check:
1. Organization exists? If not, create it first
2. Brand exists? If not, create it first
3. Then create the Product

### Step 2: Plan the Product

Determine:
- Product name and model designation
- Product type
- Parent brand
- Introduction and discontinuation dates
- Key specifications
- Real-world inspiration(s) — products often combine multiple

### Step 3: Create the Article

Follow [article-product](../../Kempopedia/article-product/skill.md) to write the article.

**Key article elements:**
- Link to manufacturer/brand in infobox
- Specifications section
- Production history
- Cultural impact/reception
- No real-world brand names in article text

### Step 4: Generate the Image

```bash
node scripts/generate-image.js "<prompt>" --name "Product Name" --category "product"
```

**Prompt for vehicles:**
```
Photorealistic photograph of a [YEAR] [Product Name], [vehicle type]. [Design details: body style, distinctive features]. Professional automotive photography, studio setting, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

**Prompt for consumer goods:**
```
Photorealistic photograph of [Product Name], a [era] [product type]. [Design details]. Professional product photography, clean background, [COLOR].
```

### Step 5: Create the Product Record

Navigate to `/admin/world-data/products/create`

| Field | Requirement | Description |
|-------|-------------|-------------|
| name | **Required** | Product name |
| productType | **Required** | See product types above |
| brandId | Recommended | Link to parent Brand — set when brand is known |
| dateIntroduced | Optional | Launch date |
| dateDiscontinued | Optional | End date — null if still made |
| articleId | **Required*** | Link to Kempopedia article |

*Every Product record should have a linked article. Create the article first, then link it.

### Step 6: Link the Article

1. In the Product form, select the article from dropdown
2. Save the Product record

### Step 7: Link the Image

1. Go to `/admin/world-data/image/manage`
2. Find the product image
3. Add ImageSubject: itemType="product", itemId=[product's ID]

### Step 8: Add Inspirations

Products often combine multiple real-world inspirations:

**Example: Monarch Model C**
- Ford Model T (mass production, pricing)
- Ford Model A (design elements)
- Early Chevrolet models (features)

Add all relevant inspirations to capture the compression.

### Step 9: Update Brand Article

Add the product to the brand's article:

```markdown
## Products

### Automobiles
- [[monarch-model-c|Monarch Model C]] (1908–1927) — The car that put Kempo on wheels
- [[monarch-imperial|Monarch Imperial]] (1940–1970) — Flagship luxury sedan
```

### Step 10: Verify Completeness

- [ ] Product record exists with brandId set
- [ ] Article exists and is linked via `articleId`
- [ ] Image exists and is linked via `ImageSubject`
- [ ] Inspirations recorded (all relevant sources)
- [ ] Brand article mentions this product
- [ ] Organization article lists this product (if major)
- [ ] Article wikilinks all resolve
- [ ] Timeline entries for major dates (launch, discontinuation)

## Update Workflow

### Updating Product Info
1. Go to `/admin/world-data/products/manage`
2. Find the product, click Edit
3. Update fields, Save

### Discontinuing a Product
1. Set `dateDiscontinued` to the end date
2. Update article to historical tense
3. Add timeline entry for discontinuation

### Model Years / Variants

For products with annual model changes (vehicles):
- One Product record for the model line
- Document variants in the article body
- Use date range: dateIntroduced to dateDiscontinued

## Relationship Tracking

### Product Referenced By

| Referenced By | Via Field | On Model |
|---------------|-----------|----------|
| Commercials | productId | CommercialMetadata |

### Product in Media

When products appear in media:
- Note in the product article under "In popular culture"
- Link from media articles to product

## Commercial Linking

When creating commercials featuring this product:

```typescript
await prisma.commercialMetadata.create({
  data: {
    videoId: "video-id",
    brandId: "brand-id",
    productId: "product-id",
    agencyId: "agency-org-id",
    campaign: "Campaign Name",
    airYear: 1955
  }
});
```

## Common Naming Patterns

| Real World | Kempo Product | Brand |
|------------|---------------|-------|
| Ford Model T | Monarch Model C | Monarch |
| Chevy Bel Air | Monarch Bel-Aire | Monarch |
| Cadillac Eldorado | Imperial Crown | Imperial |
| RCA Television | Radiant Television | Radiant |

## Compression Example

Real-world inspiration for **Monarch Model C**:
- **Ford Model T** — Mass production, assembly line, democratized car ownership
- **Ford Model A (1903)** — Early automotive pioneer
- **Oldsmobile Curved Dash** — Early popular car

Kempo version keeps the cultural significance (revolutionary affordable car) while being distinctly Kempo.

## Database Schema Reference

```prisma
model Product {
  id               String    @id @default(cuid())
  name             String
  productType      String
  brandId          String?
  brand            Brand?
  dateIntroduced   DateTime?
  dateDiscontinued DateTime?
  articleId        String?   @unique
  article          Article?

  commercials CommercialMetadata[]
}
```

## Admin Paths

| Action | Path |
|--------|------|
| Create Product | `/admin/world-data/products/create` |
| Manage Products | `/admin/world-data/products/manage` |
| Manage Images | `/admin/world-data/image/manage` |

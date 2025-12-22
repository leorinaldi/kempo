# Claude Instructions for Kempo

This is the primary instruction file for AI assistants working on the Kempo project.

## Quick Links

| Topic | Location |
|-------|----------|
| KempoNet UI patterns | [docs/kemponet-design-patterns.md](docs/kemponet-design-patterns.md) |
| Mobile testing (ngrok) | [docs/mobile-testing.md](docs/mobile-testing.md) |
| Article creation | [Skills/Kempopedia/global-rules](Skills/Kempopedia/global-rules/skill.md) |
| Simulation workflow | [docs/simulation-workflow.md](docs/simulation-workflow.md) |

## Critical Rules

### 1. Simulation Date
The Kempo universe is a living simulation. The current simulation date is the "present day."
- No future events after the current simulation date
- Living people use present tense
- No anachronisms (terms/concepts that wouldn't exist yet)

### 2. No Dead Links
Every wikilink `[[Article Name]]` must point to an existing article.
- Create stub articles before linking to new entities
- Stubs must link back to the referencing article

### 3. Calendar System
All dates use **k.y.** (Kempo Years), e.g., "March 15, 1945 k.y."

### 4. Political Parties
| Real World | Kempo Equivalent |
|------------|------------------|
| Democratic Party | National Party |
| Republican Party | Federal Party |

### 5. Image Generation
Every Person, Place, or Institution article requires an image:
```bash
node scripts/generate-image.js <slug> "<prompt>"
```

## KempoNet UI Patterns

When working on KempoNet pages (`web/src/app/kemponet/*`):

### Flash Prevention
Initialize `isEmbedded` as `true` to prevent layout flash:
```typescript
const [isEmbedded, setIsEmbedded] = useState(true)
```

### Header Positioning
```typescript
className={`sticky z-40 ${isEmbedded ? 'top-0' : 'top-14'}`}
```

### URL Parameter Preservation
```typescript
const extraParams = [
  isKempoNet ? 'kemponet=1' : '',
  isMobile ? 'mobile=1' : '',
].filter(Boolean).join('&')
```

### Testing Contexts
Test all KempoNet pages in three contexts:
1. Direct access (no params)
2. `?kemponet=1` (PC browser)
3. `?mobile=1` (phone frame)

## Skills Reference

Use Claude Skills for content creation:

| Skill | When to Use |
|-------|-------------|
| `global-rules` | **Always read first** - core rules for all articles |
| `create-person` | Biographical articles |
| `create-place` | Cities, states, nations |
| `create-institution` | Organizations, academies, parties |
| `create-media` | Songs, albums, films |
| `create-product` | Vehicles, consumer goods |
| `create-timeline` | Decade/year timeline pages |
| `date-review` | Audit dates after creating articles |
| `generate-image` | Image prompt guidelines |
| `parallel-switchover` | Real-world to Kempo mappings |

## Article Completion Checklist

Every article requires four phases:

1. **Content Quality**
   - All events on or before simulation date
   - Dates in k.y. format
   - Kempo political parties used
   - Image generated (if Person/Place/Institution)

2. **Link Integrity**
   - All wikilinks resolve
   - Stubs created for new entities
   - Stubs link back

3. **Timeline Sync**
   - Date links have timeline entries
   - Anchors use format: `<a id="1945-03-15-ky"></a>`

4. **Backlinks**
   - Related articles updated
   - "See also" sections cross-linked

## Database

Articles are stored in PostgreSQL (Neon) via Prisma ORM. Key models:
- `Article` - Kempopedia content
- `Audio` / `Video` - Media files
- `Domain` / `Page` - KempoNet sites

See `web/prisma/schema.prisma` for full schema.

## File Locations

| Content Type | Location |
|--------------|----------|
| Article images | `web/public/media/<slug>.jpg` |
| Admin content files | `web/content/admin/*.md` |
| Prisma schema | `web/prisma/schema.prisma` |
| API routes | `web/src/app/api/` |
| KempoNet pages | `web/src/app/kemponet/` |

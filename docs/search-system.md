# Kempo Search System

**Scope:** Technical documentation for Giggle search engine implementation.

For strategic overview: [Kempo Project Context.md](../Kempo%20Project%20Context.md)
For admin UI: `/admin/app-search`

---

## Overview

Giggle is Kempo's search engine, accessible at `/kemponet/giggle`. It searches across four data sources using PostgreSQL full-text search with temporal awareness.

---

## Data Sources

The search API runs a 4-part UNION query across:

| Source | Description | Key Fields |
|--------|-------------|------------|
| **Articles** | Kempopedia wiki entries (current versions) | title, content |
| **Revisions** | Historical article versions for temporal viewing | title, content, kempoDate |
| **Pages** | CMS-driven KempoNet site content | title, body, slug |
| **AppSearch** | Indexed React pages from `/kemponet/*` | title, excerpt, content |

Pages must have `searchable=true` to appear in results. AppSearch entries can be excluded via `noSearch=true`.

---

## Search Engine

### PostgreSQL Full-Text Search

The system uses PostgreSQL's `tsquery`/`tsvector` for efficient text matching.

**Query Processing:**
1. Sanitize input (remove special characters)
2. Split by spaces
3. Add prefix matching suffix (`:*`) to each word
4. Join with AND operator (`&`)

Example: `"frank martin"` becomes `frank:* & martin:*`

### Ranking Algorithm

```
rank = ts_rank(title) * 1.0 + ts_rank(content) * 0.2 + (2x multiplier if exact title match)
```

- Title matches weighted 5x more than content matches
- Exact title match (case-insensitive ILIKE) doubles the score
- Results sorted by rank descending, limited to 10

### Fallback

If full-text search fails or returns no results, the system falls back to simple case-insensitive ILIKE pattern matching across the same sources.

---

## Temporal Integration

When a viewing date is set (stored in `kempo-ky-date` cookie):

1. API converts to end-of-month Date: `new Date(year, month-1, 28, 23:59:59)`
2. Filters articles by `publishDate <= viewingDate`
3. Queries Revision table for articles with `publishDate > viewingDate`
4. Returns revision content if a matching `kempoDate` exists
5. Articles without matching revisions are excluded from results

This ensures search results reflect content as it existed at the selected viewing date.

---

## AppSearch Indexing

React pages at `/kemponet/*` are indexed via the admin panel at `/admin/app-search`.

### Scan Process

1. Recursively finds `page.tsx` files in `/src/app/kemponet/`
2. Skips dynamic routes (paths containing `[`)
3. For new pages: calls AI to analyze React component code
4. For existing pages: skips (use manual refresh)

### AI Analysis

- **Model:** Claude Sonnet
- **Extracts:**
  - `title` — What users see in search results
  - `excerpt` — 1-2 sentence description (in-universe tone)
  - `content` — Keywords and features for full-text matching
- **Context:** Prompt includes KempoNet universe context to avoid real-world brand references

### Admin Controls

| Action | Description |
|--------|-------------|
| Scan | Find and index new React pages |
| Refresh | Re-analyze individual page with AI |
| Toggle noSearch | Exclude/include page from results |
| Edit | Manually adjust title, excerpt, content |

---

## Snippet Generation

Search results include a snippet extracted from content:

1. Extract first 200 characters
2. Remove markdown formatting
3. Truncate at word boundary (~150 chars)
4. Add ellipsis if truncated

---

## Data Flow

```
User Query
    ↓
[Giggle Frontend] (/kemponet/giggle)
    ↓
fetch(`/api/search?q=...`)
    ↓
[Search API]
    ├─→ Read viewing date from cookie
    ├─→ Sanitize query → tsquery format
    ├─→ Run 4-part UNION query with ranking
    ├─→ Apply temporal filters if viewing date set
    └─→ Return top 10 results with snippets
    ↓
[Giggle Frontend] — Display results
```

---

## URL Patterns

**Search Interface:**
- `/kemponet/giggle` — Main search page
- `/kemponet/giggle/popular-sites` — Curated site directory

**Result Destinations:**
- Articles: `/kemponet/kempopedia/wiki/{slugified-title}`
- Pages: `/kemponet/{domain}/{slug}`
- App Pages: `{AppSearch.path}` (stored path)

Context parameters (`?kemponet=1` or `?mobile=1`) are preserved when navigating from embedded browsers.

---

## Key Files

| Component | Location |
|-----------|----------|
| Giggle UI | `web/src/app/kemponet/giggle/page.tsx` |
| Search API | `web/src/app/api/search/route.ts` |
| AppSearch admin | `web/src/app/admin/app-search/` |
| AppSearch model | `web/prisma/schema.prisma` |
| Slugify utility | `web/src/lib/slugify.ts` |
| KY date utility | `web/src/lib/ky-date.ts` |

---

## AppSearch Schema

```prisma
model AppSearch {
  id          String    @id @default(cuid())
  path        String    @unique          // e.g., "/kemponet/kemponet-browser"
  domain      String                     // e.g., "kemponet-browser"
  title       String                     // Display title in results
  excerpt     String    @db.Text         // 1-2 sentence search snippet
  content     String    @db.Text         // Full searchable content
  noSearch    Boolean   @default(false)  // Exclude from search if true
  refreshedAt DateTime?                  // Last AI refresh timestamp
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

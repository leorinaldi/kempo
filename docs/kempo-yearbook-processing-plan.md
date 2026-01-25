# Kempo Yearbook Processing Plan

**Created:** 2026-01-24
**Purpose:** Document the plan for restructuring skills to support systematic yearbook-to-content creation.

---

## Background

The goal is to take Kempo yearbooks (1950, 1951, and future years) and systematically convert them into Kempo universe content: database entries, Kempopedia articles, and images.

### Current State Issues

| Problem | Impact |
|---------|--------|
| Skills are article-focused, not entity-focused | Creating a person requires: DB record + article + image + inspirations + links — skills only cover the article part |
| 4 core entity types have stub skills | Brand, Publication, Event, Series can't be created systematically |
| Image style inconsistency | Some skills still reference "comic book style" but system now uses "realistic" |
| No yearbook→content workflow | Gap between "what to create" (yearbook analysis) and "how to create it" (skills) |
| Relationship linking undocumented | DB has 12+ junction tables but skills barely mention them |
| No "update" skills exist | Only creation workflows documented, not modifications |
| Event system unused | Full database support but zero skill documentation |

### Database vs Skills Gap

The database is far more sophisticated than the skills recognize:

| Database Has | Skills Document |
|--------------|-----------------|
| Person → Article (1:1) | Mentioned |
| Organization → Brand → Product | Brand skill is stub |
| ImageSubject (polymorphic) | Not explained |
| EventPerson, EventLocation, etc. | Not documented |
| PublicationSeries → Publication | Publication skill is stub |
| Inspiration table | Basic mention |

---

## Chosen Approach: Two-Tier System (Option C)

### Architecture

**Layer 1: Content Skills** (writing-focused)
- Keep existing article creation skills (article-person, etc.)
- Update for current image style, fix inconsistencies
- Focus on: what makes a good article, infobox structure, prose quality

**Layer 2: Entity Management Skills** (database-focused)
- New skills for complete entity lifecycle
- Focus on: DB records, linking, inspirations, images, cross-references
- Skills: `manage-person`, `manage-organization`, `manage-brand`, etc.

**Layer 3: Orchestration Skills** (workflow-focused)
- New: `yearbook-to-content` — master workflow from yearbook analysis to complete content
- New: `content-audit` — verify all links, images, DB records are complete

### Directory Structure

```
docs/Skills/
├── Kempopedia/           # Layer 1: Content/Writing
│   ├── article-global-rules/
│   ├── article-person/    # How to write a person article
│   ├── article-location/     # How to write a place article
│   ├── article-organization/
│   ├── article-brand/     # Complete (was stub)
│   ├── article-product/
│   ├── article-media/
│   ├── article-publication/ # Complete (was stub)
│   ├── article-event/     # Complete (was stub)
│   ├── article-series/    # Complete (was stub)
│   └── ...
├── EntityManagement/     # Layer 2: Database/Linking
│   ├── manage-person/    # Full lifecycle: DB + links + images
│   ├── manage-organization/
│   ├── manage-brand/
│   ├── manage-product/
│   ├── manage-publication/
│   ├── manage-event/
│   └── linking-guide/    # How junction tables work
└── Workflows/            # Layer 3: Orchestration
    ├── yearbook-to-content/
    └── content-audit/
```

---

## Implementation Phases

### Phase 1: Foundation

1. **Update article-global-rules**
   - Fix image style references (comic → realistic)
   - Add section on entity-article linking
   - Clarify what happens in article vs DB

2. **Complete the 4 stub skills**
   - article-brand
   - article-publication
   - article-event
   - article-series
   - Focus on article content

3. **Create linking-guide skill**
   - Document all junction tables
   - Explain ImageSubject, EventPerson, etc.
   - Show how to verify links are complete

### Phase 2: Entity Management Layer

4. **Create manage-{entity} skills** for each type:
   - manage-person (DB record + inspiration + images + article link)
   - manage-organization
   - manage-brand
   - manage-product
   - manage-location (covers nation/state/city/place)
   - manage-publication (covers series + individual issues)
   - manage-event (the unused Event system)

Each skill covers:
- When to create DB record vs article first
- Required fields and relationships
- How to link inspirations
- Image generation and linking via ImageSubject
- Cross-reference verification

### Phase 3: Yearbook Workflow

5. **Create yearbook-to-content skill**

Master orchestration skill with workflow:

```
1. INVENTORY
   - Parse yearbook analysis for new entities
   - Categorize by type and priority
   - Identify dependencies

2. FOUNDATION ENTITIES (create first)
   - Organizations (needed for brands, albums, publications)
   - Places (needed for person birth/death locations)

3. DERIVED ENTITIES
   - Brands (need org)
   - Products (need brand)
   - Albums (need artist person + label org)
   - Publications (need publisher org)

4. PEOPLE
   - Create Person DB records
   - Create articles
   - Generate images
   - Link inspirations
   - Add to Events

5. EVENTS
   - Create Event records
   - Link people, locations, media

6. VERIFICATION
   - All DB records have articles
   - All articles have images
   - All links resolve
   - All inspirations recorded
```

### Phase 4: Optional Enhancements

6. **Create content-audit skill**
   - Verify consistency across a year's content
   - Find orphaned articles (no entity link)
   - Find missing images
   - Find broken wikilinks

---

## Key Decisions (Resolved)

### Q1: Image Style for Existing Articles
**Decision:** Leave existing images as-is. Only new images use realistic style.

### Q2: Event System Usage
**Decision:** Create Event records for major yearbook events, linking to articles. Not full integration but meaningful use of the system.

### Q3: Yearbook Entity Tracking
**Decision:** Keep tracking in yearbook markdown files (analysis documents). May evolve later but works for now.

### Q4: Article-First or DB-First Workflow
**Decision:** Article first, then DB record. The article content informs the DB fields, and having the article ready makes linking easier.

---

## Skill Dependencies

```
article-global-rules (foundation for all)
    ├── article-person
    ├── article-location
    ├── article-organization
    │       └── article-brand
    │               └── article-product
    ├── article-media
    ├── article-publication
    ├── article-event
    └── article-series

linking-guide (reference for all manage-* skills)
    ├── manage-person
    ├── manage-organization
    ├── manage-brand
    ├── manage-product
    ├── manage-location
    ├── manage-publication
    └── manage-event

yearbook-to-content (orchestrates all of the above)
```

---

## Database Tables Reference

### Core Entities
- `Person` - people (links to Article via articleId)
- `Organization` - companies, institutions, parties
- `Brand` - owned by Organization
- `Product` - made by Brand
- `Nation` → `State` → `City` → `Place` - location hierarchy

### Media
- `Image` - stored in Vercel Blob
- `ImageSubject` - polymorphic link (image to any entity)
- `Audio`, `AudioElement` - songs, albums
- `Video`, `VideoElement` - films, episodes

### Publications
- `PublicationSeries` - newspapers, magazines, book series
- `Publication` - individual issues/books
- `PublicationElement` - links publications to people (author, editor, etc.)

### Events
- `Event` - with hierarchy (parent/children)
- `EventPerson` - role-based link to people
- `EventLocation` - polymorphic link to locations
- `EventMedia` - polymorphic link to media
- `EventRelation` - links between events

### Metadata
- `Inspiration` - real-world to Kempo mappings
- `Article` - Kempopedia entries

---

## Progress Tracking

### Phase 1 (COMPLETED 2026-01-24)
- [x] Update article-global-rules (image style, entity-article linking)
- [x] Complete article-brand skill
- [x] Complete article-publication skill
- [x] Complete article-event skill
- [x] Complete article-series skill
- [x] Create linking-guide skill
- [x] Update article-person skill (realistic image prompts)
- [x] Update article-location skill (realistic image prompts)
- [x] Update article-organization skill (realistic image prompts)
- [x] Update article-product skill (realistic image prompts)
- [x] Update CLAUDE.md with new skill references

### Phase 2 (COMPLETED 2026-01-24)
- [x] Create manage-person skill
- [x] Create manage-organization skill
- [x] Create manage-brand skill
- [x] Create manage-product skill
- [x] Create manage-location skill
- [x] Create manage-publication skill
- [x] Create manage-event skill

### Phase 3 (COMPLETED 2026-01-24)
- [x] Create yearbook-to-content skill

### Phase 4 (Optional)
- [ ] Create content-audit skill

---

## Notes

- Focus is on Kempopedia articles, DB entries, and images
- Audio/video content generation is out of scope for now
- Yearbook analysis documents remain the source for "what to create"
- Each phase builds on the previous; can pause between phases if needed

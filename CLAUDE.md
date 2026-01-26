# Claude Instructions for Kempo

**Scope:** AI assistant routing file. Points to documentation, skills, and file locations for working on this project.

For strategic overview, philosophy, and content pipeline, see [Kempo Project Context.md](Kempo%20Project%20Context.md).

For quick start and developer setup, see [README.md](README.md).

For entity taxonomy and how data models relate, see [docs/data-model.md](docs/data-model.md).

## Temporal System (IMPORTANT)

Kempo has a **viewing date** system. Users can set a date (e.g., "June 1950") and the system shows content as it existed at that time. This affects:

- **Articles**: Filtered by `publishDate`; older versions stored in `Revision` table
- **Media** (future): Songs, videos, publications will also respect viewing date

### Key Rules

1. **New content**: Set `publishDate` to when the content would have been "current" in the Kempo universe
2. **Updating existing articles**: Create a `Revision` with the OLD content BEFORE updating, so users viewing at earlier dates see the previous version
3. **Revision.kempoDate**: String like "January 1, 1950 k.y." indicating when that version was current

### Example: Article Update Workflow

When adding 1950 events to an article that existed in 1949:
```
1. Save current content as Revision (kempoDate: "January 1, 1950 k.y.")
2. Update article with new content
3. Set article.publishDate to after the new events (e.g., Dec 1, 1950)
```

Result: Users viewing at June 1950 see the revision (no new events); users at Dec 1950 see current article.

See [yearbook-to-content](docs/Skills/Workflows/yearbook-to-content/skill.md) for full revision workflow details.

## Session Start

When asked to "start session", "follow session start protocol", or similar, follow [docs/Skills/claude-code-session-start](docs/Skills/claude-code-session-start/skill.md).

## Session Close

When asked to "close the session", "session close protocol", or similar, follow [docs/Skills/claude-code-session-close](docs/Skills/claude-code-session-close/skill.md).

## Backlog Management (via MPM)

Kempo's backlog is managed in MPM (Mega Project Manager) via direct database access.

- **Product Slug**: `kempo`
- **MPM Database**: Direct PostgreSQL connection (no MPM app needed)

When asked to "review backlog", "what's next", or after completing a task, follow [/Users/leonardorinaldi/Claude/MPM/skills/backlog-review/skill.md](/Users/leonardorinaldi/Claude/MPM/skills/backlog-review/skill.md) using product slug `kempo`.

### Quick Backlog Fetch

```bash
npx tsx -e "
import pg from 'pg';
const client = new pg.Client('postgresql://neondb_owner:npg_lQmMIGq9Jzk4@ep-empty-scene-ahjbwz2v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');
await client.connect();
const SLUG = 'kempo';
const prod = await client.query('SELECT id, name FROM products WHERE slug = \$1', [SLUG]);
if (!prod.rows[0]) { console.log('Product not found'); process.exit(1); }
const projects = await client.query('SELECT id, name FROM backlog_projects WHERE product_id = \$1 AND status != \$2 ORDER BY sort_order', [prod.rows[0].id, 'archived']);
for (const p of projects.rows) {
  console.log('## ' + p.name);
  const tasks = await client.query('SELECT title, status, priority FROM backlog WHERE project_id = \$1 ORDER BY sort_order', [p.id]);
  tasks.rows.forEach(t => console.log('  - [' + t.status + '] ' + t.title));
}
await client.end();
"
```

For full reference, see [/Users/leonardorinaldi/Claude/MPM/skills/project-connector/skill.md](/Users/leonardorinaldi/Claude/MPM/skills/project-connector/skill.md).

## Documentation

| Topic | Location |
|-------|----------|
| Project context & philosophy | [Kempo Project Context.md](Kempo%20Project%20Context.md) |
| Data model & taxonomy | [docs/data-model.md](docs/data-model.md) |
| Article creation rules | [docs/Skills/Kempopedia/article-global-rules](docs/Skills/Kempopedia/article-global-rules/skill.md) |
| Entity linking guide | [docs/Skills/EntityManagement/linking-guide](docs/Skills/EntityManagement/linking-guide/skill.md) |
| Yearbook guiding principles | [docs/yearbooks/guiding-principles.md](docs/yearbooks/guiding-principles.md) |
| KempoNet UI patterns | [docs/kemponet-design-patterns.md](docs/kemponet-design-patterns.md) |
| Search system (Giggle) | [docs/search-system.md](docs/search-system.md) |
| Mobile testing (ngrok) | [docs/mobile-testing.md](docs/mobile-testing.md) |
| Event system | [docs/event-system.md](docs/event-system.md) |
| Backup system | [docs/database-backup.md](docs/database-backup.md) |
| Database schema | [web/prisma/schema.prisma](web/prisma/schema.prisma) |

## Skills

### Kempopedia Skills (Article Format)

| Skill | Purpose |
|-------|---------|
| `article-global-rules` | Core rules for all articles (read first) |
| `article-person` | Biographical article format |
| `article-location` | Location articles (nations, states, cities, places) |
| `article-organization` | Organization article format |
| `article-brand` | Brand article format |
| `article-product` | Product article format |
| `article-media` | Media article format (songs, albums, films) |
| `article-publication` | Publication article format |
| `article-event` | Event article format |
| `article-series` | TV series article format |
| `article-timeline` | Timeline page format |
| `article-misc` | Miscellaneous articles that don't fit other categories |

### Entity Management Skills (Full Lifecycle)

| Skill | Purpose |
|-------|---------|
| `linking-guide` | How junction tables and relationships work |
| `manage-person` | Full lifecycle: Person record + article + image + inspirations |
| `manage-organization` | Full lifecycle: Organization + brands + child entities |
| `manage-brand` | Full lifecycle: Brand + products + parent org |
| `manage-product` | Full lifecycle: Product + brand + inspirations |
| `manage-location` | Full lifecycle: Nation/State/City/Place hierarchy |
| `manage-publication` | Full lifecycle: PublicationSeries + issues + contributors |
| `manage-series` | Full lifecycle: TV Series + network + cast/crew |
| `manage-event` | Full lifecycle: Event + timeline + relationships |

### Workflow Skills (Orchestration)

| Skill | Purpose |
|-------|---------|
| `yearbook-to-content` | Master workflow: yearbook analysis → complete content creation |
| `quality-control` | Run battery of QC checks on content (dead links, images, entities, etc.) |

### Yearbook Skills

| Skill | Purpose |
|-------|---------|
| `real-yearbook` | Historical research documents by year |
| `kempo-yearbook` | Kempo universe planning documents by year |

### Supporting Skills

| Skill | Purpose |
|-------|---------|
| `generate-image` | Image generation with Grok/Gemini |
| `design-entity` | Plan new entities before creation |
| `inspirations` | Real-world to Kempo mappings |
| `date-review` | Audit dates after creating articles |

### Session Skills

| Skill | Purpose |
|-------|---------|
| `claude-code-session-start` | Dev server, ngrok tunnel, disable login, review project history |
| `claude-code-session-close` | Commit changes, update project history, re-enable login |

Note: Backlog review is now handled via MPM. See "Backlog Management (via MPM)" section above.

### Skill Locations

- Kempopedia skills: `docs/Skills/Kempopedia/<skill-name>/skill.md`
- Entity management skills: `docs/Skills/EntityManagement/<skill-name>/skill.md`
- Workflow skills: `docs/Skills/Workflows/<skill-name>/skill.md`
- Other skills: `docs/Skills/<skill-name>/skill.md`

## File Locations

| Content | Location |
|---------|----------|
| Article images | Vercel Blob (tracked in Image table) |
| Yearbooks (Real & Kempo) | `docs/yearbooks/` |
| Yearbook guiding principles | [docs/yearbooks/guiding-principles.md](docs/yearbooks/guiding-principles.md) |
| Prisma schema | `web/prisma/schema.prisma` |
| API routes | `web/src/app/api/` |
| KempoNet pages | `web/src/app/kemponet/` |
| Image generation script | `scripts/generate-image.js` |
| Dead link checker | `scripts/check-dead-links.js` |

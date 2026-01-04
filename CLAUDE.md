# Claude Instructions for Kempo

**Scope:** AI assistant routing file. Points to documentation, skills, and file locations for working on this project.

For project overview, storylines, interfaces, and developer setup, see [README.md](README.md).

## Session Start

When asked to "start session", "follow session start protocol", or similar, follow [docs/Skills/claude-code-session-start](docs/Skills/claude-code-session-start/skill.md).

## Session Close

When asked to "close the session", "session close protocol", or similar, follow [docs/Skills/claude-code-session-close](docs/Skills/claude-code-session-close/skill.md).

## Documentation

| Topic | Location |
|-------|----------|
| Article creation rules | [docs/Skills/Kempopedia/global-rules](docs/Skills/Kempopedia/global-rules/skill.md) |
| KempoNet UI patterns | [docs/kemponet-design-patterns.md](docs/kemponet-design-patterns.md) |
| Mobile testing (ngrok) | [docs/mobile-testing.md](docs/mobile-testing.md) |
| Simulation workflow | [docs/simulation-workflow.md](docs/simulation-workflow.md) |
| Event system | [docs/event-system.md](docs/event-system.md) |
| Database schema | [web/prisma/schema.prisma](web/prisma/schema.prisma) |

## Skills

| Skill | Purpose |
|-------|---------|
| `global-rules` | Core rules for all articles (read first) |
| `create-person` | Biographical articles |
| `create-place` | Cities, states, nations |
| `create-organization` | Institutions, companies, parties, academies |
| `create-media` | Songs, albums, films |
| `create-product` | Vehicles, consumer goods |
| `create-timeline` | Decade/year timeline pages |
| `date-review` | Audit dates after creating articles |
| `generate-image` | Image prompt guidelines |
| `parallel-switchover` | Real-world to Kempo mappings |

Skills are located at `docs/Skills/Kempopedia/<skill-name>/skill.md`

## File Locations

| Content | Location |
|---------|----------|
| Article images | `web/public/media/<slug>.jpg` |
| Simulation planning docs | `web/content/admin/*.md` |
| Prisma schema | `web/prisma/schema.prisma` |
| API routes | `web/src/app/api/` |
| KempoNet pages | `web/src/app/kemponet/` |
| Image generation script | `scripts/generate-image.js` |

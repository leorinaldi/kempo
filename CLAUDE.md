# Claude Instructions for Kempo

This file routes to documentation and resources. For detailed instructions, follow the links below.

## Documentation

| Topic | Location |
|-------|----------|
| Article creation rules | [docs/Skills/Kempopedia/global-rules](docs/Skills/Kempopedia/global-rules/skill.md) |
| KempoNet UI patterns | [docs/kemponet-design-patterns.md](docs/kemponet-design-patterns.md) |
| Mobile testing (ngrok) | [docs/mobile-testing.md](docs/mobile-testing.md) |
| Simulation workflow | [docs/simulation-workflow.md](docs/simulation-workflow.md) |
| Database schema | [web/prisma/schema.prisma](web/prisma/schema.prisma) |

## Skills

| Skill | Purpose |
|-------|---------|
| `global-rules` | Core rules for all articles (read first) |
| `create-person` | Biographical articles |
| `create-place` | Cities, states, nations |
| `create-institution` | Organizations, academies, parties |
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

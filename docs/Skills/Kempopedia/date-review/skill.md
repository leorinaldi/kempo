# Date Review Skill

Audit an article for timeline synchronization after creation.

> This is Phase 3 of the article completion process. See [article-global-rules](../article-global-rules/skill.md).

## When to Use

- After creating a new article
- After editing an article that adds new dates
- When a user reports broken date links

## Important: Linked vs Unlinked Dates

**Only create date wikilinks for significant milestones.**

### Link these dates (`[[date k.y.]]`):
- Births and deaths of notable people
- Marriages of notable people
- Major appointments, elections, inaugurations
- Major historical events
- Founding dates of institutions

### Do NOT link (plain text):
- General time references ("in the early 1920s")
- Contextual dates ("prices dropped from $850 in 1908 to $290 by 1924")
- Approximate dates ("around 1907")

## Process

### Step 1: Extract Linked Date References

Search for wikilink dates only:
- Prose: `[[January 1, 1910 k.y.]]`
- Frontmatter: `dates:` array
- Infobox: `Birth_date`, `Founded`, etc.

### Step 2: Determine Target Timeline

| Date Type | Timeline Page | Anchor |
|-----------|---------------|--------|
| Pre-1950 | Decade page | `#1945-ky` or `#1945-08-06-ky` |
| 1950+ | Year page | `#1950-ky` or `#1950-01-15-ky` |

### Step 3: Verify & Create Missing Entries

For each date:
1. Open the timeline file
2. Search for the anchor ID
3. If missing, add entry:

```markdown
<a id="1914-01-05-ky"></a>
**January 5, 1914 k.y.** — [[article-slug|Subject]] does something significant.
```

## Anchor ID Format

| Date Format | Anchor ID |
|-------------|-----------|
| `1913 k.y.` | `1913-ky` |
| `June 1915 k.y.` | `1915-06-ky` |
| `January 5, 1914 k.y.` | `1914-01-05-ky` |

Month numbers: January=01, February=02, ... December=12

## Checklist

- [ ] Extract all linked date references
- [ ] For each date: verify anchor exists in timeline
- [ ] Add missing entries with proper anchors
- [ ] Verify entries link back to article
- [ ] Confirm chronological order in timeline

# Date Review Skill

**Run this skill after completing any article to ensure all date links have corresponding timeline entries.**

This skill audits an article for timeline synchronization issues and helps fix them.

## Important: Linked vs Unlinked Dates

**Only create date wikilinks for significant milestones that warrant a timeline entry.**

### Dates that SHOULD be linked (`[[date k.y.]]`):
- Births and deaths of notable people
- Marriages of notable people
- Major appointments, elections, inaugurations
- Significant military promotions
- Major historical events (wars, treaties, disasters)
- Founding/opening dates of institutions and places
- Major product launches or business milestones

### Dates that should NOT be linked (plain text):
- General time references ("in the early 1920s", "by 1916")
- Contextual dates ("prices dropped from $850 in 1908 to $290 by 1924")
- Intermediate events that don't warrant their own timeline entry
- Approximate dates ("around 1907", "the mid-1920s")

**Example:**
```markdown
<!-- LINKED - Major milestone, needs timeline entry -->
The plant opened on January 1, [[1910 k.y.]]

<!-- UNLINKED - Contextual, no timeline entry needed -->
By 1916, black enamel had become the standard color.
```

## When to Use

- After creating a new article
- After editing an article that adds new dates
- As a periodic audit of existing articles
- When a user reports broken date links

## Process

### Step 1: Extract All LINKED Date References

Search the article for **wikilink dates only** (these are the ones that need timeline entries):

1. **Wikilink dates in prose**: `[[January 1, 1910 k.y.]]`, `[[1913 k.y.]]`
2. **Frontmatter dates**: In the `dates:` array (these should match linked dates in the article)
3. **Infobox dates**: Fields like `Birth_date`, `Founded`, `Opened`, etc.

**Note:** Plain text dates (unlinked) do NOT need timeline entries - skip them.

### Step 2: Determine Target Timeline

For each date, determine which timeline page it should link to:

| Date Type | Timeline Page | Anchor Format |
| --------- | ------------- | ------------- |
| Pre-1950 year only (e.g., `1913 k.y.`) | Decade page (`1910s`) | `#1913-ky` |
| Pre-1950 with month (e.g., `June 1915 k.y.`) | Decade page (`1910s`) | `#1915-06-ky` |
| Pre-1950 full date (e.g., `January 5, 1914 k.y.`) | Decade page (`1910s`) | `#1914-01-05-ky` |
| 1950+ year only | Year page (`1950`) | `#1950-ky` |
| 1950+ with month/day | Year page (`1950`) | `#1950-01-15-ky` |

### Step 3: Verify Timeline Entries Exist

For each date, check the corresponding timeline page:

1. **Open the timeline file** (e.g., `timelines/1910s.md`)
2. **Search for the anchor ID** (e.g., `<a id="1914-01-05-ky"></a>`)
3. **Record status**: ✓ exists or ✗ missing

### Step 4: Create Missing Entries

For each missing entry, add to the appropriate timeline:

```markdown
<a id="YYYY-MM-DD-ky"></a>
**Month DD, YYYY k.y.** — [Event description with [[wikilinks]] to relevant articles].
```

**Rules for timeline entries:**
- Place entries in chronological order within their year section
- If year section doesn't exist, create it with `## YYYY k.y.` heading
- Include links back to the article being audited
- Keep descriptions concise (1-2 sentences)

### Step 5: Verify Bidirectional Links

Ensure the timeline entry links back to the article:
- Timeline should mention/link the subject
- Article should link to the date

## Checklist

```
□ Extract all date references from article
□ For each date:
  □ Identify target timeline page
  □ Check if anchor exists
  □ If missing: add entry with proper format
  □ Verify entry links back to article
□ Confirm all dates now resolve correctly
```

## Example Audit

**Article**: `lakeside-plant.md`

**Dates found**:
| Date | Timeline | Anchor | Status |
| ---- | -------- | ------ | ------ |
| January 1, 1910 k.y. | 1910s | `1910-01-01-ky` | ✗ Missing |
| October 7, 1913 k.y. | 1910s | `1913-10-07-ky` | ✗ Missing |
| January 5, 1914 k.y. | 1910s | `1914-01-05-ky` | ✓ Exists |
| May 26, 1927 k.y. | 1920s | `1927-05-26-ky` | ✓ Exists |

**Action**: Add missing entries to `1910s.md`:

```markdown
<a id="1910-01-01-ky"></a>
**January 1, 1910 k.y.** — The [[lakeside-plant|Lakeside Plant]] opens in [[Detroit]], designed by architect Albert Kahn.

<a id="1913-10-07-ky"></a>
**October 7, 1913 k.y.** — [[henry-c-durant|Henry C. Durant]] introduces the moving assembly line at the [[lakeside-plant|Lakeside Plant]].
```

## Anchor ID Format Reference

| Date Format | Anchor ID |
| ----------- | --------- |
| `1913 k.y.` | `1913-ky` |
| `June 1915 k.y.` | `1915-06-ky` |
| `January 5, 1914 k.y.` | `1914-01-05-ky` |
| `March 15, 1945 k.y.` | `1945-03-15-ky` |

**Month numbers**: January=01, February=02, ... December=12

## Integration with Article Creation

This skill should be run as **Phase 3** of the article completion process (see [[global-rules]]):

```
Phase 1: Content Quality
Phase 2: Link Integrity (no dead links)
Phase 3: Timeline Synchronization ← THIS SKILL
Phase 4: Backlinks & Cross-References
```

**Best practice**: Run date review immediately after completing Phase 2, before moving to Phase 4.

## Common Issues

### Issue: Date in prose but not in wikilink
**Problem**: "The plant opened on January 1, 1910" (no `[[]]`)
**Solution**: Convert to `[[January 1, 1910 k.y.]]` for automatic linking

### Issue: Anchor exists but no descriptive entry
**Problem**: Timeline has `<a id="1910-ky">` but no content about the event
**Solution**: Add descriptive text mentioning the article subject

### Issue: Date too specific for existing entry
**Problem**: Article uses `October 7, 1913 k.y.` but timeline only has `1913 k.y.` section
**Solution**: Add specific date anchor within the year section

### Issue: Frontmatter date not linked in article body
**Problem**: Date appears in `dates:` array but not as `[[wikilink]]` in prose
**Solution**: Either remove from frontmatter or add wikilink in body

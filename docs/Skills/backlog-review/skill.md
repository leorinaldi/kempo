# Backlog Review

Run this skill when the user asks to "review backlog", "what should we work on next", "backlog check", or after completing a task.

## Overview

This skill synchronizes the backlog with actual work completed and helps prioritize next steps. It runs in two phases:

1. **Sync Phase**: Compare backlog against session activity to identify needed updates
2. **Prioritization Phase**: Suggest next steps (skip if in session close process)

## Phase 1: Sync Backlog with Session Activity

### 1.1 Gather Context

Collect information about recent work:

```bash
# Recent git commits (what was actually done)
git -C /Users/leonardorinaldi/Claude/Kempo log --oneline -20

# Recent project history entries
cd /Users/leonardorinaldi/Claude/Kempo/web && DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const entries = await prisma.projectHistory.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  entries.forEach(e => console.log(\`[\${e.createdAt.toISOString().split('T')[0]}] \${e.content}\`));
}
main().finally(() => prisma.\$disconnect());
"
```

Also consider:
- What was discussed/accomplished in the current conversation
- Any features built, bugs fixed, or tasks mentioned as complete

### 1.2 Fetch Current Backlog

```bash
curl -s http://localhost:3000/api/backlog | jq '.projects[] | {name: .name, items: [.items[] | {title: .title, status: .status}]}'
```

### 1.3 Identify Discrepancies

Compare the backlog against actual work. Look for:

| Issue | Example |
|-------|---------|
| **Completed but not marked** | Task says "pending" but git shows feature was built |
| **In progress but done** | Task says "in_progress" but work was finished |
| **New work not tracked** | Significant work done that has no backlog item |
| **Stale tasks** | Tasks that are no longer relevant |
| **Blocking dependencies** | Task A should be done before Task B but order is wrong |

### 1.4 Suggest Updates

Present findings to the user in a clear format:

```
**Backlog Sync Suggestions:**

1. Mark as completed:
   - "Create archive feature for backlog" - implemented this session

2. Consider adding:
   - "Backlog review skill" - created but not in backlog

3. May be stale:
   - [none identified]
```

Wait for user confirmation before making any changes to backlog status.

To update a task status:
```bash
curl -X PATCH http://localhost:3000/api/backlog \
  -H "Content-Type: application/json" \
  -d '{"id": "TASK_ID", "status": "completed"}'
```

---

## Phase 2: Suggest Next Steps

**Skip this phase if:**
- User is in session close process
- User explicitly said they're done for now

### 2.1 Analyze Backlog Priority

The backlog is ordered intentionally—items at the top of each project are higher priority. Consider:

**Primary Recommendation (Top of List):**
- First pending task in the first project
- Why it's positioned there (if context available)

**Alternative Recommendations:**
Look down the list for tasks that might be worth doing instead:

| Reason to Bump | Example |
|----------------|---------|
| **High value, low effort** | Quick win that unblocks other work |
| **Dependency** | Task B depends on Task A being done first |
| **Context efficiency** | Already have relevant files open/knowledge fresh |
| **Momentum** | Small task to build momentum before big one |

### 2.2 Present Options

Format suggestions clearly:

```
**Next Steps:**

**Option A (Next in Queue):**
- Project: "1950-1951 Yearbook Texture Enhancement"
- Task: "Add texture sections to Real 1951 Yearbook"
- Effort: L | Priority: High
- Context: [brief description of what this involves]

**Option B (Alternative):**
- Project: "Create Chart of Content Counts"
- Task: "Create Page in Admin for Tracking Progress/Counts"
- Effort: M | Priority: Medium
- Why consider: Quick administrative win, lower cognitive load

What would you like to work on?
```

### 2.3 Wait for Guidance

**Do not proceed with any task until the user indicates which to work on.**

Exception: If user has explicitly said "keep going down the list" or "work through the backlog", continue to the next task automatically after completing each one.

---

## After Task Completion

When a task is completed:

1. Update the task status in backlog
2. Re-run this skill (Phase 1 + Phase 2)
3. Present next options

This creates a loop: Complete → Sync → Suggest → Wait → Complete → ...

---

## Quick Reference

### Fetch backlog
```bash
curl -s http://localhost:3000/api/backlog
```

### Update task status
```bash
curl -X PATCH http://localhost:3000/api/backlog \
  -H "Content-Type: application/json" \
  -d '{"id": "TASK_ID", "status": "completed"}'
```

### Archive a project
```bash
curl -X PATCH http://localhost:3000/api/backlog \
  -H "Content-Type: application/json" \
  -d '{"id": "PROJECT_ID", "type": "project", "status": "archived"}'
```

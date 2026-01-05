/**
 * Event Inventory Extraction Script
 *
 * Scans all Kempopedia articles and extracts potential events from:
 * - timelineEvents JSON field
 * - infobox dates (birth, death, founding, etc.)
 * - tags for cross-cutting themes
 *
 * Outputs a markdown inventory document for review.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TimelineEvent {
  date: string;
  headline: string;
  description?: string;
}

interface Infobox {
  born?: string;
  died?: string;
  birthPlace?: string;
  deathPlace?: string;
  founded?: string;
  dissolved?: string;
  released?: string;
  spouse?: string;
  marriageDate?: string;
  [key: string]: unknown;
}

interface ExtractedEvent {
  source: 'timelineEvent' | 'infobox' | 'dates';
  date: string;
  headline: string;
  description?: string;
  suggestedType?: string;
  suggestedSignificance?: number;
}

interface ArticleEvents {
  articleId: string;
  articleTitle: string;
  articleType: string;
  tags: string[];
  events: ExtractedEvent[];
  potentialParents: string[];
}

// Cross-cutting themes to identify based on tags
const THEME_PATTERNS: Record<string, string[]> = {
  'World War II': ['world-war-ii', 'wwii', 'ww2'],
  'The Antelope Springs Incident': ['ufo', 'antelope-springs', 'extraterrestrial'],
  'Organized Crime': ['mafia', 'organized-crime', 'crime-syndicate'],
  'Golden Age of Hollyvale': ['hollyvale', 'pacific-pictures', 'film-industry'],
  'Kellman Administration': ['kellman', 'president-kellman', 'kellman-administration'],
  'Space Program': ['space', 'rocket', 'nasa-equivalent'],
  'Cold War': ['cold-war', 'soviet', 'espionage'],
};

function inferEventType(headline: string, articleType: string, infoboxField?: string): string {
  const h = headline.toLowerCase();

  // Infobox-specific
  if (infoboxField === 'born') return 'birth';
  if (infoboxField === 'died') return 'death';
  if (infoboxField === 'founded') return 'founding';
  if (infoboxField === 'dissolved') return 'dissolution';
  if (infoboxField === 'released') return 'release';
  if (infoboxField === 'marriageDate') return 'marriage';

  // From headline keywords
  if (h.includes('born') || h.includes('birth')) return 'birth';
  if (h.includes('dies') || h.includes('died') || h.includes('death') || h.includes('killed')) return 'death';
  if (h.includes('marries') || h.includes('married') || h.includes('wedding')) return 'marriage';
  if (h.includes('divorce')) return 'divorce';
  if (h.includes('founded') || h.includes('establishes') || h.includes('opens')) return 'founding';
  if (h.includes('elected') || h.includes('election')) return 'election';
  if (h.includes('inaugurated') || h.includes('sworn in')) return 'inauguration';
  if (h.includes('releases') || h.includes('released') || h.includes('premiere')) return 'release';
  if (h.includes('records') || h.includes('recording')) return 'recording';
  if (h.includes('war') || h.includes('declares war')) return 'war';
  if (h.includes('battle') || h.includes('attack')) return 'battle';
  if (h.includes('treaty') || h.includes('armistice') || h.includes('surrender')) return 'treaty';
  if (h.includes('crash') || h.includes('disaster') || h.includes('incident')) return 'incident';
  if (h.includes('discovers') || h.includes('discovery')) return 'discovery';
  if (h.includes('resigns') || h.includes('resignation')) return 'resignation';
  if (h.includes('appointed') || h.includes('joins') || h.includes('hired')) return 'appointment';
  if (h.includes('retires') || h.includes('retirement')) return 'retirement';
  if (h.includes('publishes') || h.includes('publication')) return 'publication';

  // Default based on article type
  if (articleType === 'person') return 'milestone';
  if (articleType === 'organization') return 'milestone';
  if (articleType === 'event') return 'incident';
  if (articleType === 'culture') return 'release';

  return 'milestone';
}

function inferSignificance(headline: string, articleType: string, eventType: string): number {
  const h = headline.toLowerCase();

  // High significance events
  if (eventType === 'war' || h.includes('world war')) return 10;
  if (h.includes('president') && (eventType === 'death' || eventType === 'election')) return 9;
  if (h.includes('antelope springs')) return 9;
  if (eventType === 'election' && h.includes('president')) return 8;

  // Medium-high
  if (eventType === 'death' && (h.includes('famous') || h.includes('legendary'))) return 7;
  if (eventType === 'founding' && articleType === 'organization') return 6;
  if (eventType === 'release' && articleType === 'culture') return 5;

  // Medium
  if (eventType === 'birth' || eventType === 'death') return 4;
  if (eventType === 'marriage') return 3;

  // Default
  return 5;
}

function identifyThemes(tags: string[]): string[] {
  const themes: string[] = [];

  for (const [theme, patterns] of Object.entries(THEME_PATTERNS)) {
    if (tags.some(tag => patterns.some(p => tag.toLowerCase().includes(p)))) {
      themes.push(theme);
    }
  }

  return themes;
}

function extractFromInfobox(infobox: Infobox, articleTitle: string, articleType: string): ExtractedEvent[] {
  const events: ExtractedEvent[] = [];

  if (infobox.born) {
    events.push({
      source: 'infobox',
      date: infobox.born,
      headline: `Birth of ${articleTitle}`,
      description: infobox.birthPlace ? `Born in ${infobox.birthPlace}` : undefined,
      suggestedType: 'birth',
      suggestedSignificance: 3,
    });
  }

  if (infobox.died) {
    events.push({
      source: 'infobox',
      date: infobox.died,
      headline: `Death of ${articleTitle}`,
      description: infobox.deathPlace ? `Died in ${infobox.deathPlace}` : undefined,
      suggestedType: 'death',
      suggestedSignificance: 4,
    });
  }

  if (infobox.founded) {
    events.push({
      source: 'infobox',
      date: infobox.founded,
      headline: `Founding of ${articleTitle}`,
      suggestedType: 'founding',
      suggestedSignificance: 6,
    });
  }

  if (infobox.dissolved) {
    events.push({
      source: 'infobox',
      date: infobox.dissolved,
      headline: `Dissolution of ${articleTitle}`,
      suggestedType: 'dissolution',
      suggestedSignificance: 5,
    });
  }

  if (infobox.released) {
    events.push({
      source: 'infobox',
      date: infobox.released,
      headline: `Release of ${articleTitle}`,
      suggestedType: 'release',
      suggestedSignificance: 5,
    });
  }

  if (infobox.marriageDate && infobox.spouse) {
    events.push({
      source: 'infobox',
      date: infobox.marriageDate,
      headline: `${articleTitle} marries ${infobox.spouse}`,
      suggestedType: 'marriage',
      suggestedSignificance: 3,
    });
  }

  return events;
}

function extractFromTimeline(timeline: TimelineEvent[], articleTitle: string, articleType: string): ExtractedEvent[] {
  return timeline.map(te => {
    const eventType = inferEventType(te.headline, articleType);
    return {
      source: 'timelineEvent' as const,
      date: te.date,
      headline: te.headline,
      description: te.description,
      suggestedType: eventType,
      suggestedSignificance: inferSignificance(te.headline, articleType, eventType),
    };
  });
}

async function main() {
  console.log('Extracting event inventory from Kempopedia articles...\n');

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      tags: true,
      infobox: true,
      timelineEvents: true,
      dates: true,
    },
    orderBy: { title: 'asc' },
  });

  const inventory: ArticleEvents[] = [];
  const themeArticles: Record<string, string[]> = {};
  let totalEvents = 0;

  for (const article of articles) {
    const events: ExtractedEvent[] = [];

    // Extract from infobox
    if (article.infobox) {
      const infoboxEvents = extractFromInfobox(
        article.infobox as Infobox,
        article.title,
        article.type
      );
      events.push(...infoboxEvents);
    }

    // Extract from timelineEvents
    if (article.timelineEvents && Array.isArray(article.timelineEvents)) {
      const timelineEvents = extractFromTimeline(
        article.timelineEvents as TimelineEvent[],
        article.title,
        article.type
      );
      events.push(...timelineEvents);
    }

    // Identify themes
    const themes = identifyThemes(article.tags);

    // Track theme membership
    for (const theme of themes) {
      if (!themeArticles[theme]) themeArticles[theme] = [];
      themeArticles[theme].push(article.title);
    }

    if (events.length > 0 || themes.length > 0) {
      inventory.push({
        articleId: article.id,
        articleTitle: article.title,
        articleType: article.type,
        tags: article.tags,
        events,
        potentialParents: themes,
      });
      totalEvents += events.length;
    }
  }

  // Generate markdown output
  let md = `# Event Inventory\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `- Total articles scanned: ${articles.length}\n`;
  md += `- Articles with events: ${inventory.length}\n`;
  md += `- Total events extracted: ${totalEvents}\n\n`;

  // Themes section
  md += `## Cross-Cutting Themes\n\n`;
  md += `These themes should become parent events:\n\n`;
  for (const [theme, articleList] of Object.entries(themeArticles)) {
    md += `### ${theme}\n\n`;
    md += `Articles: ${articleList.length}\n`;
    md += articleList.map(a => `- ${a}`).join('\n') + '\n\n';
  }

  // Events by type
  const byType: Record<string, number> = {};
  inventory.forEach(ai => {
    ai.events.forEach(e => {
      const t = e.suggestedType || 'unknown';
      byType[t] = (byType[t] || 0) + 1;
    });
  });

  md += `## Events by Type\n\n`;
  const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sortedTypes) {
    md += `- ${type}: ${count}\n`;
  }
  md += '\n';

  // Detailed inventory by article type
  const articleTypes = ['person', 'event', 'organization', 'place', 'culture', 'timeline', 'product', 'concept'];

  for (const aType of articleTypes) {
    const articlesOfType = inventory.filter(a => a.articleType === aType);
    if (articlesOfType.length === 0) continue;

    md += `## ${aType.charAt(0).toUpperCase() + aType.slice(1)} Articles\n\n`;

    for (const article of articlesOfType) {
      md += `### ${article.articleTitle}\n\n`;

      if (article.potentialParents.length > 0) {
        md += `**Themes:** ${article.potentialParents.join(', ')}\n\n`;
      }

      if (article.events.length > 0) {
        md += `| Date | Event | Type | Sig | Source |\n`;
        md += `|------|-------|------|-----|--------|\n`;

        for (const e of article.events) {
          const desc = e.description ? ` - ${e.description.substring(0, 50)}...` : '';
          md += `| ${e.date} | ${e.headline}${desc} | ${e.suggestedType} | ${e.suggestedSignificance} | ${e.source} |\n`;
        }
        md += '\n';
      } else {
        md += `_No events extracted (themes only)_\n\n`;
      }
    }
  }

  // Output
  console.log(md);

  // Also output JSON for programmatic use
  const jsonOutput = {
    summary: {
      totalArticles: articles.length,
      articlesWithEvents: inventory.length,
      totalEvents,
      eventsByType: byType,
    },
    themes: themeArticles,
    inventory,
  };

  // Write JSON file
  const fs = await import('fs/promises');
  await fs.writeFile(
    '/Users/leonardorinaldi/Claude/Kempo/docs/event-inventory.json',
    JSON.stringify(jsonOutput, null, 2)
  );
  console.log('\n\nJSON output written to docs/event-inventory.json');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

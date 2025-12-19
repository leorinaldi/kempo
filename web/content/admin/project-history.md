---
title: "Project History"
slug: "project-history"
type: concept
subtype: meta
status: published
tags:
  - meta
  - history
  - milestones
---

```json
{
  "infobox": {
    "type": "concept",
    "fields": {
      "Purpose": "Track real-world milestones in the Kempo Project",
      "Started": "December 13, 2025",
      "Status": "Active development"
    }
  }
}
```

**Project History** documents the real-world milestones, achievements, and development history of the Kempo Project. This page tracks when features were added, major content milestones, and significant decisions made during development.

---

## 2025

### December 2025

#### December 19, 2025 (Night)

**Kempo Mobile Launched** — iPhone-style device experience
- New `/mobile` route featuring realistic iPhone frame with Safari browser
- Space Gray iPhone design with rounded corners, Dynamic Island area, home indicator bar
- Real-time clock in status bar (updates every minute) with signal bars and battery icon
- Safari browser interface with functional address bar (type URLs and press Enter to navigate)
- Back button (circle with chevron) for browser history navigation
- Favorites star button (visual placeholder for future bookmarks feature)
- Browser loads KempoNet content via iframe with `?mobile=1` context parameter
- Header automatically hides when viewing pages inside mobile browser
- KempoNetBridge updated to detect mobile context and preserve it across navigation
- Blue glow drop-shadow effect matching other device aesthetics

**Home Page Device Reorder** — Updated device selector carousel
- Device order changed to: Mobile, PC, TV, Radio (left to right)
- Default selection now PC (second position) instead of first position
- Added MobileIcon component (iPhone silhouette in graphic novel style)

**Media Aspect Ratio Field** — Video orientation classification
- Added `aspectRatio` field to Prisma Media schema (landscape, portrait, square)
- All existing videos classified as "landscape"
- Admin upload form now includes aspect ratio dropdown for future uploads

**Device Page Positioning** — Vertical alignment adjustments
- TV page: `pt-20` (moved up slightly)
- Radio page: `pt-32` (moved up from center)
- Mobile page: `pt-12`
- PC page: `pt-12`

---

#### December 19, 2025 (Evening)

**Kempopedia Database Migration** — Articles now stored in PostgreSQL
- Migrated all 182 Kempopedia articles from markdown files to PostgreSQL database
- Created `Article` model with slug, title, type, content (markdown), infobox (JSON), timelineEvents (JSON), tags, dates
- Created `Revision` model for tracking article history with editSummary, kempoDate, and kempoEvent fields
- Each article has an initial revision dated "January 1, 1950 k.y."
- Converted all page components to async database queries
- Markdown files in `content/articles/` now serve as backups only
- Enables future features: revision history UI, full-text search, admin editing

**UI Cleanup** — Streamlined Kempopedia interface
- Removed footer text "Kempopedia is part of the Kempo universe project" from all pages
- Removed tagline "The encyclopedia of the Kempo universe" from header

**Global Navigation Header** — Unified top navigation across all pages
- Created fixed header with "KEMPO" logo (white with blue glow) linking to home
- Black background with blue glow effect at the bottom
- Header automatically hides when viewing pages inside KempoScape Navigator (via `?kemponet=1`)
- Spacer element ensures page content isn't hidden behind fixed header
- KempoScape Navigator compass icon appears on `/kemponet/*` pages for returning to PC view

**PC Device Page** — Separated device from content
- Created new `/pc` route for the PC device experience
- `/kemponet` now redirects to `/pc`
- All KempoNet web pages (`/kemponet/*`) remain at their current URLs
- Compass icon in header links to `/pc?url=kttp://[current-page]` to view page in KempoScape

**PC Intro Animation** — Guided onboarding experience
- PC page starts with desktop view (KempoScape Navigator closed)
- Animated white mouse cursor appears in center of screen
- Cursor smoothly moves to KempoScape Navigator icon (1.2s animation)
- Pauses briefly on icon so user can read "KempoScape Navigator" label
- Simulates click, then browser window opens
- Intro skipped when arriving via URL parameter (from compass button)

**Kempo TV Intro Video** — Branded startup experience
- Added "Kempo TV start.mp4" intro video that plays when TV is turned on
- Intro displays full-width (cropped top/bottom to fill screen)
- After intro ends, transitions to first video in playlist
- Clicking channel knob during intro skips to regular programming
- Intro resets when TV is turned off

**Home Page Device Rotator** — Visual device selector
- Replaced text links with interactive device rotator carousel
- Styled icons for PC, TV, and Radio matching graphic novel aesthetic
- Circle arrow buttons with blue glow for left/right navigation
- Dot indicators showing current selection (clickable to jump)
- Starts on PC, cycles through TV and Radio
- Clicking device icon navigates to that page

**Page Cleanup** — Streamlined interfaces
- Removed "KEMPO RADIO", "KEMPO TV", "KEMPONET" titles from device pages
- Removed "Back to Kempo" links (now handled by header)
- Removed attribution text below Radio, TV, and KempoNet
- Radio display panel now clickable (links to artist's Kempopedia page)
- TV screen now clickable (links to artist's Kempopedia page)

**About Page Shortened** — Concise introduction
- Audio and text now stop at "This world is called Kempo."
- Reduced from full narration to focused 20-second intro
- Maintains fade effect with key phrases staying visible at end

---

#### December 19, 2025 (Morning)

**KempoNet Architecture Overhaul** — Generalized browser simulation with settings
- Created `/kemponet/kemple` as standalone page (previously inline in main KempoNet)
- Created `/kemponet/kemposcape` — KempoScape Navigator settings/home page:
  - Home page location setting (persisted to localStorage)
  - Show address bar toggle (functional, takes effect immediately)
  - Quick links to Kemple, Kempopedia, KempoTube
  - KempoSoft Corporation branding and welcome message
- Made address bar fully editable — type `kttp://` URLs and press Enter to navigate
- Added browser settings button (K compass icon) to toolbar for quick access to settings
- Settings changes apply immediately via storage events (no page reload needed)
- Added KempoScape to Kemple dropdown menu (alphabetical: Kempopedia, KempoScape, KempoTube)
- `BROWSER_HOME` constant for configurable default home page

**KempoNet Link Sandboxing** — Constrained browser to kemponet URLs only
- KempoNetBridge now strips non-kemponet links from DOM (keeps text, removes clickability)
- MutationObserver watches for dynamic content and strips new external links
- Prevents navigation outside the `/kemponet/*` namespace while inside KempoScape Navigator
- Removed special-case "Kemple" button from Kempopedia header
- Removed "Back to Kempo/Kemple" links from KempoTube header
- Simplified Kempopedia header to just show "Kempopedia" (no breadcrumb)

**First Database Implementation** — PostgreSQL database with Prisma ORM
- Established Neon PostgreSQL as the first non-blob database for Kempo
- Prisma ORM for type-safe database access
- Created `Media` table storing all audio/video metadata:
  - slug, name, type (audio/video), url (Vercel Blob reference)
  - artist, artistSlug for attribution and Kempopedia linking
  - description for media details
  - kyDate for Kempo universe dates (when the content was "created" in-universe)
  - createdAt/updatedAt for real-world timestamps
- Created `RadioPlaylistItem` and `TvPlaylistItem` tables for playlist management
- Playlists now ordered by kyDate (chronologically by in-universe date)

**Media System Overhaul**
- Upload API now saves to database and auto-generates Kempopedia article stubs
- Slug conflict detection prevents overwriting existing Kempopedia articles
- Radio and TV playlist management via simple dropdown selection (no manual entry)
- All 14 media items migrated with researched kyDate values from Kempopedia

**Player Conversions**
- Kempo Radio converted from `/radio-playlist.json` to database API
- Kempo TV converted from `/tv-playlist.json` to database API
- KempoTube converted to database API with artist attribution
- All players now show content in reverse chronological order (newest first)
- Artist names link to Kempopedia articles

**KempoNet Navigation Improvements**
- Added KempoNetBridge to KempoTube for proper URL tracking
- Fixed back/forward button navigation (iframe now reloads correctly)
- Cross-section navigation between Kempopedia and KempoTube works seamlessly

**URL Restructure for KempoNet Consistency**
- Moved `/kempopedia` to `/kemponet/kempopedia`
- Moved `/kempotube` to `/kemponet/kempotube`
- Now `kttp://xyz` in KempoNet directly maps to `/kemponet/xyz` real URLs
- Updated 13 files with new path references
- Simpler path conversion logic in KempoNet browser
- Easier to add new KempoNet sites in the future

---

#### December 18, 2025

**About Page Created** — Immersive narrated introduction to the Kempo universe
- New /about page accessible from home page via "KEMPO" and tagline links
- Static announcer image on left, synchronized text on right
- Click to play button for user-initiated audio playback
- Narrated audio with SRT-synced subtitles appearing in real-time
- Current text displays white, past text fades to grey as narration progresses
- Ending effect: non-essential text fades to black, key phrase remains white:
  - "A world that echoes our reality, but has changed just enough... This world is called Kempo."
- Blue glow "Back to Kempo" link matching other pages

**Home Page Tagline Update**
- Changed tagline from "A fictional world simulation" to "A (nearly) imaginary world."
- Both "KEMPO" title and tagline now link to the About page

**Project Scope Refinement**
- Updated README and Kempopedia descriptions to clarify the Kempo concept
- Kempo is now described as "an alternate branch of reality that diverged around the late 1800s"
- Major people, companies, and products have different names by the 1950s
- Larger cities and nations retain real-world names; colleges and smaller towns often don't
- Technology progress follows similar pace to "base reality"

---

#### December 17, 2025 (Evening)

**Modern Graphic Novel Redesign** — Visual overhaul of all media interfaces
- Applied consistent modern graphic novel style across Radio, TV, and KempoNet
- Bold dark outlines (4px borders), flat colors, hard offset shadows
- Black backgrounds with white text and blue glow effects
- Blue drop-shadow glow around all device units (radio, TV, monitor)
- Metallic gray color schemes replacing previous brown/wood tones

**Home Page Intro Experience**
- Video intro plays on first visit and page refresh
- Skips to final frame on back navigation (no replay)
- Fixed React Strict Mode double-invocation in development
- SessionStorage backup for mobile browsers that unload JS on navigation
- Black background to prevent white flash during transitions

**Mobile Responsive Improvements**
- TV and KempoNet screens now responsive (calc(100vw-2rem) on mobile, 650px on desktop)
- Reduced padding on mobile for better space utilization
- KempoNet monitor height adjusts (400px mobile, 500px desktop)

**KempoTube Mobile Fixes**
- Video thumbnails now load properly on mobile (#t=0.5 time fragment)
- Play button always visible on mobile (hover doesn't work on touch)
- Hidden custom fullscreen button on mobile (native auto-fullscreen is better UX)

**KempoNet Navigation Fix**
- Fixed iframe double-load blink when clicking links inside Kempopedia
- Separated display path (address bar) from iframe src (actual loading)
- Internal navigation no longer causes iframe recreation

**Other Updates**
- KempoScape Navigator now opens by default when visiting KempoNet
- Reduced spacing between tagline and links on home page for mobile
- Attribution text increased to text-sm across all pages

---

#### December 17, 2025 (Morning)

**KempoNet Launched** — Immersive 1990s PC browsing experience
- Created KempoNet interface at /kemponet with authentic 1990s beige PC monitor
- CRT effects including scanlines and screen curvature
- **KempoScape Navigator** browser (Netscape-inspired) with full navigation
- **Kemple** search engine home page (Google-inspired with colorful logo)
- Working Back/Forward/Home buttons with history tracking
- Address bar showing "kttp://" URLs (fictional protocol)
- **KS Portals 25** operating system (Windows-inspired):
  - Go menu (Start menu equivalent) with program launcher
  - Desktop with KempoScape Navigator icon
  - Taskbar showing minimized windows
  - "About This PC" dialog with fictional computer specs
- "Break the fourth wall" maximize button — exits KempoNet to view Kempopedia in real browser
- Window controls: minimize, maximize, close with authentic behavior

**Fictional Computing Ecosystem Established**
- KempoSoft Portals (Windows parallel)
- KempoScape Navigator (Netscape parallel)
- Kemple (Google parallel)
- Kempaq Scenario (Compaq parallel)
- Kemptel Prontium II (Intel Pentium parallel)
- Kvidia Nova 128 (Nvidia parallel)

**Technical Implementation**
- KempoNetBridge component for iframe-parent communication
- KempoNetRedirect to prevent window-in-window recursion
- Smooth client-side navigation using Next.js router
- Fixed useSearchParams static generation issues

**Other Updates**
- Project History section created — Admin area to track real-world project milestones
- Simulation period renamed from 1948-1950 to 1946-1950
- Places planning document added to simulation workflow
- Kempopedia header breadcrumbs (Kempo > Kempopedia navigation)

---

#### December 16, 2025

**Antelope Springs UFO Storyline** — Major narrative arc completed
- Created 14 new articles for UFO storyline (Frank Caldwell, Margaret Caldwell, Virgil Stokes, Raymond Colvin, Harlan Whitmore, Nathan Collier, Leonard Vance, Robert Whitfield, Charles Garrison, Antelope Springs Incident, Whitfield Committee, Ridgecrest Army Air Field, Antelope Springs NM, Stokes Ranch)
- Added 5 new state pages (Kentucky, New Mexico, West Virginia, Louisiana, Illinois)
- **Link statistics feature** — Kempopedia home now shows total internal link count and per-category link counts

**Edward Stanton & Broadcasting**
- Created Edward Stanton (Edward R. Murrow / Walter Cronkite / Eric Sevareid hybrid)
- Created UBC Evening News flagship program
- Added London, England, Washington state, Polebridge place pages

**Consumer Products**
- Created Feldmann Brewing Company and Feldmann Beer (Milwaukee)
- Created Whitfield Tobacco Company and Koala cigarettes
- Added Wisconsin, Milwaukee, North Carolina place pages
- Created 1850s timeline

---

#### December 15, 2025

**Organized Crime Ecosystem** — Major storyline expansion
- Created 8 crime figures: Salvatore Conti (boss), Sol Roth (financial architect), Enzo Ferrante (rival), Savannah Fontaine (the Queen), Paulie Caruso (bodyguard), Sidney Hartman (Vegas), Carmine DeMarco (Tammany), Jack Callahan (union leader)
- Created locations: Lucky Sands Casino, The Claridge Hotel, The Royale Imperial
- Created American Drivers Union (Teamsters parallel)
- Created Monarch Imperial luxury car

**Silver Screen Awards** — Hollywood awards system
- Created Silver Screen Awards / Silver Screen Guild (Academy Awards parallel)
- Updated all Academy Awards references throughout

**Hollywood Ecosystem** — Studio system established
- Created Pacific Pictures studio and Kagan brothers (Samuel, Nathan)
- Created Irving Lazar (agent), William Garrett (director), Clay Marshall (Western star)
- Created Catherine Marlowe, Eleanor Weston (leading ladies)
- Created Bernie Kessler (TV pioneer), Walter Brennan (broadcasting executive)
- Created United Broadcasting Company
- Created Western films: Dust and Honor (1939), Abilene Dawn (1946)

**Admin System Launched**
- Moved spawn-registry.md to admin content
- Created simulation management admin pages
- Added Featured Storylines section to README

---

#### December 14, 2025

**Media Publishing Empire**
- Created Randolph Mercer (Hearst/Pulitzer parallel) — media mogul
- Created Athlete Magazine (sports magazine)
- Detroit Sentinel now owned by Mercer Publications
- Created United States nation page, New York state page

**Entertainment & Music**
- Created Dorothy Sherwood (Judy Garland/Marilyn Monroe parallel)
- Created Joseph Carter (Henry Luce parallel) — magazine publisher
- New songs and video content

**Kempo TV System Launched**
- VideoPlayer component for embedded video
- TV playlist management in admin panel
- New TV-related articles

**Kempo Radio System Launched**
- AudioPlayer component for embedded audio
- Radio playlist management in admin panel
- Admin dropdown to select audio files from Vercel Blob
- Auto-fill track info from Kempopedia

**Admin Panel & Authentication**
- NextAuth v5 with Google OAuth
- Admin panel at /admin for media uploads
- JWT session strategy with email whitelist
- Login page and middleware protection

**Frank Martino & Music Industry**
- Created Frank Martino (Sinatra/Dean Martin parallel)
- Created "This Perfect Holiday" song with embedded audio
- Created "A Martino Christmas" album
- Created Starlight Records (Columbia/Capitol parallel)
- Created Melody Index (Billboard parallel)

**Soviet Leadership**
- Created Grigori Voronov (Malenkov/Khrushchev parallel)
- Created Joseph Stalin, Raymond Holbrook articles
- Created People's Party of the Soviet Union

**Continental Motors & Automotive**
- Created Continental Motors Corporation (GM/Ford parallel)
- Created Henry C. Durant (Ford/Durant hybrid founder)
- Created Douglas D. Westbrook (Eisenhower/MacArthur hybrid)
- Created Continental Model C, Continental Courier products

**Category System Launched**
- Category pages with browse functionality
- Categories: People, Places, Institutions, Events, Timeline, Science, Culture, Concepts
- Nations moved under Places with subtype

**Image Generation System**
- Grok API script for comic book style images
- Color-by-era rules (B&W pre-1955, muted 1955-65, full color 1965+)
- Generated images for all existing articles

**Timeline Restructure**
- Split master timeline into decade pages (pre-1950) and year pages (1950+)
- Master timeline now serves as index
- Date links route to appropriate decade/year page

**Skills System Reorganized**
- Skills reorganized into folders with skill.md
- Added: create-place, create-timeline, generate-image, create-media, create-product, date-review skills
- Infobox field capitalization standardized (Birth_place not birth_place)
- 4-phase article completion checklist established

---

#### December 13, 2025 — PROJECT LAUNCH

**Initial Commit**
- Kempopedia: fictional encyclopedia with Wikipedia-style articles
- Next.js web app with MDX article rendering
- Infobox components and wiki-style CSS
- k.y. calendar system (matches Gregorian years)
- Sample article: President Varicron

**Vercel Deployment**
- Moved articles to web/content for Vercel deployment
- Site live at kempo.vercel.app

**Parallel Switchover System**
- New hybrid category system with type/subtype/tags/dates
- Parallel switchover support for real→fictional mappings
- Timeline integration with date-level anchors
- Parallel Switchover Registry (later renamed Spawn Registry)
- Skills: parallel-switchover, create-person, create-institution

**First Parallel Switchover: Harold S. Kellman**
- Harold S. Kellman created (Truman parallel) — first character!
- Associated place switchovers: Lamar→Lawton, Independence→Liberty, Grandview→Clearview
- Institution switchovers: Kansas City School of Law→Midland Law School

---

## Summary Statistics

### Content Created (Dec 13-19, 2025)
- **100+ articles** across all categories
- **8 major storylines** established (Politics, Hollywood, Crime, Broadcasting, Music, UFO, Military, Business)
- **50+ character portraits** generated
- **Multiple decade timelines** (1800s through 1950s)
- **14 media items** with kyDate metadata (5 audio, 9 video)

### Technical Features
- Kempopedia wiki system with infoboxes
- Category browsing system
- Kempo Radio with audio player
- Kempo TV with video player
- KempoTube video browsing interface
- KempoNet 1990s PC browsing experience
- Kempo Mobile iPhone browsing experience
- Admin panel with Google OAuth
- **PostgreSQL database** (Neon) with Prisma ORM
- **182 Kempopedia articles stored in database** with revision history
- Media upload to Vercel Blob + database metadata
- Database-backed playlists with kyDate ordering
- Auto-generation of Kempopedia article stubs on media upload
- Image generation via Grok API
- Link statistics tracking

### Process & Documentation
- Simulation Advancement Approach methodology
- Spawn Registry for tracking parallel switchovers
- 17+ skills documented for article creation
- Global rules for consistency

---

## How to Use This Document

When significant milestones occur in the Kempo Project, add them here with:
- The real-world date
- A brief description of the milestone
- Any relevant context or links

### Types of Milestones to Track

- **Content milestones** — Number of articles, characters created, timelines completed
- **Feature additions** — New sections, tools, or functionality
- **Technical changes** — Architecture decisions, migrations, integrations
- **Process improvements** — Methodology updates, workflow changes
- **Major decisions** — Significant choices that shaped the project direction

---

## See Also

- [[simulation-advancement-approach|Simulation Advancement Approach]] — Methodology for advancing the simulation
- [[spawn-registry|Spawn Registry]] — Completed parallel switchovers

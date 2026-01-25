# Kempo 1950 Content Creation Progress

**Created:** 2026-01-24
**Source:** [kempo-1950-yearbook-analysis.md](kempo-1950-yearbook-analysis.md)
**Workflow:** [yearbook-to-content](../Skills/Workflows/yearbook-to-content/skill.md)

---

## Phase 1: Inventory (COMPLETE)

### Summary Counts

| Entity Type | To Create | Already Exists |
|-------------|-----------|----------------|
| People | 24 | 52 |
| Organizations | 12 | 21 |
| Brands | 3 | 6 |
| Products | TBD | 9 |
| Cities | 2 | 26 |
| Publication Series | 0 | 7 |
| TV Series | 3 | 0 |
| Events | 10+ | varies |

---

## Phase 2: Foundation Entities (COMPLETE)

### Cities (Need to Create First)

| City | State | Inspired By | Status |
|------|-------|-------------|--------|
| Steel City | Pennsylvania | Pittsburgh | [x] DONE |
| Capital City | District of Columbia | Washington D.C. | [x] DONE |

**Notes:**
- Created District of Columbia state record for Capital City
- Both cities have DB records + articles with infoboxes
- Images pending

### Organizations (Foundation - Need Before People)

#### Film Studios
| Name | Type | Notes | Status |
|------|------|-------|--------|
| Pinnacle Pictures | studio | Prestige studio, rival to Pacific Pictures | [x] DONE |

#### Automotive
| Name | Type | Notes | Status |
|------|------|-------|--------|
| Pioneer Automobile Company | company | Founded 1903 Motor City, ~20% market | [x] DONE |

#### Steel/Industry
| Name | Type | Notes | Status |
|------|------|-------|--------|
| American Steel Corporation | company | Largest industrial company, HQ Steel City | [x] DONE |

#### Retail
| Name | Type | Notes | Status |
|------|------|-------|--------|
| Hartwell's | company | Department store, founded Philadelphia 1859 | [x] DONE |

#### Veterans/Civic
| Name | Type | Notes | Status |
|------|------|-------|--------|
| American Veterans League (AVL) | organization | Founded 1919, posts in every town | [x] DONE |

#### Sports
| Name | Type | Notes | Status |
|------|------|-------|--------|
| United League Baseball (ULB) | league | 10 teams, 2 conferences | [x] DONE |

#### Education/Medical
| Name | Type | Notes | Status |
|------|------|-------|--------|
| New England University | university | Elite Ivy League equivalent, Boston | [x] DONE |
| New England University Medical School | institution | Premier medical research | [x] DONE |
| Hartwell Medical Institute | institution | In Steel City, vaccine research | [x] DONE |
| National Foundation for Child Health | foundation | Funds vaccine research | [x] DONE |

#### Government
| Name | Type | Notes | Status |
|------|------|-------|--------|
| Fletcher Committee | committee | Organized crime investigation (May 1950) | [x] DONE |

---

## Phase 3: Derived Entities (COMPLETE - Core items)

### Brands (Pioneer Automobile)

| Brand | Parent Org | Segment | Status |
|-------|------------|---------|--------|
| Pioneer | Pioneer Automobile Company | mainstream | [x] DONE |
| Falcon | Pioneer Automobile Company | mid-range/sporty | [x] DONE |
| Crestwood | Pioneer Automobile Company | premium | [x] DONE |

### TV Series (Series record + Article)

| Title | Network | Host/Star | Notes | Status |
|-------|---------|-----------|-------|--------|
| The Dusty Dalton Show | UBC | Dusty Dalton | Debuted 1949, merchandising phenomenon | [x] DONE |
| The Uncle Ned Show | UBC | Uncle Ned | Debuted 1948, children's programming | [x] DONE |

Each TV series needs:
- Article (type: culture, subtype: tv-series) [x]
- Series record with `articleId` link [x]
- Image (promotional still or title card) - pending

### Comic Strip (PublicationSeries type: comic + Article)

| Title | Creator | Debut | Notes | Status |
|-------|---------|-------|-------|--------|
| Bramblewood | Walter Hendricks | Oct 2, 1950 | Woodland animals, Peanuts+Pogo hybrid | [x] DONE |

Each comic strip needs:
- Article (type: publication, subtype: comic) [x]
- PublicationSeries record (type: comic) with `articleId` link [x]
- PublicationElement linking creator (role: author/illustrator) - pending (needs Person record)
- Image (comic panel style) - pending

### Brightway Shows (Goodwin & Langford)

| Title | Year | Notes | Status |
|-------|------|-------|--------|
| Oklahoma Wind | 1943 | Breakthrough hit | [x] DONE |
| Prairie Carousel | 1945 | Second major success | [x] DONE |
| Pacific Moon | 1949 | Stars Maxine Merrill | [x] DONE |
| Annie of the West | 1946 | Stars Maxine Merrill | [x] DONE |

### Baseball Teams (ULB)

**Eastern League:**
| Team | City | Notes | Status |
|------|------|-------|--------|
| New York Empires | New York | Joe Rosetti's team, 1950 champions | [ ] |
| Boston Beacons | Boston | | [ ] |
| Philadelphia Pennies | Philadelphia | | [ ] |
| Capital City Captains | Capital City | | [ ] |
| Steel City Bandits | Steel City | | [ ] |

**Western League:**
| Team | City | Notes | Status |
|------|------|-------|--------|
| Motor City Cougars | Motor City | | [ ] |
| Chicago Gray Sox | Chicago | | [ ] |
| Cleveland Scouts | Cleveland | Willie Banks' team | [ ] |
| Cincinnati Rivermen | Cincinnati | | [ ] |
| St. Louis Robins | St. Louis | | [ ] |

---

## Phase 4: People (COMPLETE)

### Entertainment

| Name | Age (1950) | Role | Dependencies | Status |
|------|------------|------|--------------|--------|
| Dusty Dalton | 38 | Western TV star | UBC (exists) | [x] DONE |
| Walter Hendricks | 30 | Comic strip artist | None | [x] DONE |
| Edward "Ned" Hartley (Uncle Ned) | 32 | Children's TV host | UBC (exists) | [x] DONE |
| Jerome Goodwin | 48 | Brightway composer | None | [x] DONE |
| Howard Langford | 55 | Brightway lyricist | None | [x] DONE |
| Maxine Merrill | 38 | Brightway leading lady | None | [x] DONE |

### Sports

| Name | Age (1950) | Role | Dependencies | Status |
|------|------------|------|--------------|--------|
| Joe Rosetti | ~30 | Baseball star, NY Empires | ULB, Empires | [x] DONE |
| Willie Banks | ~28 | Baseball pioneer, Cleveland Scouts | ULB, Scouts | [x] DONE |
| Eddie Lawson | ~32 | Heavyweight boxing champion | None | [x] DONE |
| Rocco Marchetti | ~25 | Rising boxing contender | None | [x] DONE |
| Mickey Brennan | 36 | Veteran boxer, contender | None | [x] DONE |

### Business

| Name | Age (1950) | Role | Dependencies | Status |
|------|------------|------|--------------|--------|
| George Crane | 75 | Pioneer Automobile founder (chairman emeritus) | Pioneer Auto | [x] DONE |
| Warren Prescott | 56 | American Steel president | American Steel | [x] DONE |
| Lawrence Mitchell | 48 | Hartwell's CEO | Hartwell's | [x] DONE |
| Theodore Hartwell | ~45 | Hartwell's Chairman | Hartwell's | [x] DONE |
| Josiah Hartwell | d.1909 | Hartwell's founder (historical) | Hartwell's | [x] DONE |
| Andrew Dunbar | d.1924 | American Steel founder (historical) | American Steel | [x] DONE |

### Science

| Name | Age (1950) | Role | Dependencies | Status |
|------|------------|------|--------------|--------|
| David Salter | 36 | Vaccine researcher (Rigorio) | Hartwell Medical | [x] DONE |
| Albert Kovar | ~45 | Rival vaccine researcher | New England University Medical School | [x] DONE |

### Politics/Government

| Name | Age (1950) | Role | Dependencies | Status |
|------|------------|------|--------------|--------|
| Alden Cross | 46 | Convicted spy (State Dept) | New England U | [x] DONE |
| Russell Fletcher | 48 | Senator (Federal), organized crime | Fletcher Committee | [x] DONE |

### Veterans/Military

| Name | Age (1950) | Role | Dependencies | Status |
|------|------------|------|--------------|--------|
| Richard "Dick" Tanner | 42 | AVL National Commander | AVL | [x] DONE |
| Frederick "Fightin' Freddie" Nash | d.1948 | AVL founder (historical) | AVL | [x] DONE |

### Publications

| Name | Age (1950) | Role | Dependencies | Status |
|------|------------|------|--------------|--------|
| Ernest Beckford | 51 | Major author | None | [x] DONE |

---

## Phase 5: Events & Timeline (COMPLETE)

### Major Events (Event Records Created for Significance 7+)

| Event | Date | Significance | Status |
|-------|------|--------------|--------|
| Alden Cross convicted | Jan 21, 1950 | 8 - Fuels Red Panic | [x] DONE |
| H-bomb development authorized | Jan 31, 1950 | 8 - Arms race | [x] DONE |
| Whitfield "List" speech | Feb 9, 1950 | 9 - Launches Red Panic | [x] DONE |
| Lawson vs. Brennan (boxing) | Mar 4, 1950 | 6 - Sports | [x] Timeline |
| Silver Screen Awards | Mar 25, 1950 | 6 - Entertainment | [x] Timeline |
| ULB Opening Day | Apr 15, 1950 | 5 - Sports | [x] Timeline |
| Fletcher Committee established | May 3, 1950 | 7 - Organized crime | [x] DONE |
| Korean War begins | Jun 25, 1950 | 10 - Major war | [x] DONE |
| Seoul falls | Jun 28, 1950 | 8 - War milestone | [x] DONE |
| Westbrook commands Korea | late Jun 1950 | 7 - Military | [x] DONE |
| ULB All-Star Game | Jul 11, 1950 | 5 - Sports (Banks selected) | [x] Timeline |
| Inchon Landing | Sep 15, 1950 | 9 - War turning point | [x] DONE |
| Seoul recaptured | Sep 28, 1950 | 8 - War milestone | [x] DONE |
| Bramblewood debuts | Oct 2, 1950 | 6 - Cultural | [x] Timeline |
| ULB Championship | Oct 7-15, 1950 | 6 - Sports | [x] Timeline |
| Pyongyang captured | Oct 19, 1950 | 7 - War milestone | [x] DONE |
| Chinese intervention | Nov 25-28, 1950 | 9 - War escalation | [x] DONE |
| Midterm elections | Nov 7, 1950 | 7 - Political | [x] DONE |

### Timeline Page Updates

- [x] 1950.md - Created with all major events and anchors

---

## Phase 6: Cross-References (PARTIAL)

### Articles Updated

| Existing Article | Update Needed | Status |
|------------------|---------------|--------|
| United Broadcasting Company | Add Dusty Dalton Show, Uncle Ned Show | [x] DONE |
| Motor City | Pioneer Automobile mention | [x] DONE |
| Steel City | American Steel mention | [x] Already had it, fixed links |
| Harold S. Kellman | Korean War, Whitfield conflict | [x] DONE |
| Robert Whitfield | Red Panic pivot, February speech | [x] DONE |
| Douglas D. Westbrook | Korean War command | [x] DONE |

---

## Phase 7: Verification

### Verification Checklist

- [x] All 24 new people have: DB record, Article (**Images and Inspirations pending**)
- [x] All 12 new organizations have: DB record, Article (**Images pending**)
- [x] All 3 new brands have: DB record, linked to Pioneer Auto (**Images pending**)
- [ ] All 10 baseball teams have: representation in ULB structure (deferred)
- [x] Timeline 1950.md has all major events with anchors
- [x] All wikilinks in new articles resolve (audited - fixed hartwells, motor-city, steel-city, brand slugs)
- [ ] All ImageSubject links created for images (images not yet generated)
- [x] Cross-references updated in key existing articles (UBC, Motor City, Steel City)

### Session Summary (2026-01-25)

**Completed:**
- 12 Organization records with articles
- 3 Brand records with articles
- 2 City records with articles
- 2 TV Series records with articles
- 1 PublicationSeries (comic) with article
- 24 Person records with articles
- 13 Event records for significance 7+ events
- 1950 Timeline page with all major events
- Cross-references for UBC, Motor City, Steel City
- 30 Inspiration records for people
- Cross-reference updates for Kellman, Whitfield, Westbrook
- 4 Brightway show articles (Oklahoma Wind, Prairie Carousel, Pacific Moon, Annie of the West)
- Baseball teams represented in ULB article structure

**Completed (2026-01-24):**
- Image generation for all entities - **47 images generated**
  - 24 people portraits
  - 11 organization logos
  - 2 city images
  - 3 brand badges
  - 3 TV/Comic images
  - 4 Brightway posters

**Known acceptable gaps:**
- Baseball team individual articles (deferred - teams listed in ULB article)
- Some states not yet created (Tennessee, Wyoming, Minnesota, Connecticut, Georgia, Maryland, Virginia)
- Topic pages (broadway, boxing, comic-strips, television-in-america, organized-crime-in-america)

---

## Dependency Order (Recommended Creation Sequence)

### Wave 1: Foundation
1. Cities: Steel City, Capital City
2. Organizations: Pioneer Automobile, American Steel, Hartwell's, AVL, ULB
3. Organizations: New England University, New England University Medical School, Hartwell Medical, National Foundation for Child Health, Fletcher Committee
4. Organizations: Pinnacle Pictures

### Wave 2: Derived Entities
5. Brands: Pioneer, Falcon, Crestwood
6. Series: Dusty Dalton Show, Uncle Ned Show
7. Comic: Bramblewood
8. Brightway shows (articles only, no DB records needed)
9. Baseball teams (may be represented within ULB article)

### Wave 3: Historical Figures (Deceased)
10. People: Josiah Hartwell, Andrew Dunbar, Frederick Nash

### Wave 4: Business Leaders
11. People: George Crane, Warren Prescott, Lawrence Mitchell, Theodore Hartwell

### Wave 5: Entertainment
12. People: Dusty Dalton, Walter Hendricks, Uncle Ned, Jerome Goodwin, Howard Langford, Maxine Merrill

### Wave 6: Sports
13. People: Joe Rosetti, Willie Banks, Eddie Lawson, Rocco Marchetti, Mickey Brennan

### Wave 7: Other
14. People: Ernest Beckford, David Salter, Albert Kovar, Alden Cross, Russell Fletcher, Richard Tanner

### Wave 8: Events & Timeline
15. Events: Create Event records for significance 7+ events
16. Timeline: Update 1950.md with all entries

### Wave 9: Verification
17. Cross-references and verification

---

## Notes

- Focus is on Kempopedia articles, DB entries, and images
- Audio/video content generation is out of scope
- Images should use realistic style (Grok default, Gemini for text)
- Pre-1955 subjects: black and white images
- Each entity should follow the manage-{type} skill workflow

---

## Image Generation Queue

Run from project root: `cd /Users/leonardorinaldi/Claude/Kempo`

### People - Entertainment (6)

```bash
# Dusty Dalton - Western TV star, age 38
node scripts/generate-image.js "Photorealistic portrait photograph of a 38-year-old white male, rugged Western TV cowboy star. Weathered handsome face, confident smile, wearing cowboy hat and Western shirt. Professional studio lighting, 1950s photography style, black and white." --name "Dusty Dalton" --category "portrait"

# Walter Hendricks - Comic strip artist, age 30
node scripts/generate-image.js "Photorealistic portrait photograph of a 30-year-old white male, young comic strip artist. Bespectacled, friendly expression, artistic appearance. Wearing casual button-down shirt. Professional studio lighting, 1950s photography style, black and white." --name "Walter Hendricks" --category "portrait"

# Uncle Ned (Edward Hartley) - Children's TV host, age 32
node scripts/generate-image.js "Photorealistic portrait photograph of a 32-year-old white male, friendly children's television host. Warm avuncular expression, gentle eyes, wearing cardigan sweater. Professional studio lighting, 1950s photography style, black and white." --name "Uncle Ned" --category "portrait"

# Jerome Goodwin - Brightway composer, age 48
node scripts/generate-image.js "Photorealistic portrait photograph of a 48-year-old white male, distinguished Brightway composer. Intense creative expression, dark hair, wearing formal dark suit. Professional studio lighting, 1950s photography style, black and white." --name "Jerome Goodwin" --category "portrait"

# Howard Langford - Brightway lyricist, age 55
node scripts/generate-image.js "Photorealistic portrait photograph of a 55-year-old white male, elegant Brightway lyricist. Refined appearance, graying temples, thoughtful expression. Wearing tweed jacket with bow tie. Professional studio lighting, 1950s photography style, black and white." --name "Howard Langford" --category "portrait"

# Maxine Merrill - Brightway leading lady, age 38
node scripts/generate-image.js "Photorealistic portrait photograph of a 38-year-old white female, glamorous Brightway star. Beautiful, strong features, confident expression, elegant styling. Wearing evening attire with pearl earrings. Professional studio lighting, 1950s photography style, black and white." --name "Maxine Merrill" --category "portrait"
```

### People - Sports (5)

```bash
# Joe Rosetti - Baseball star, age ~30
node scripts/generate-image.js "Photorealistic portrait photograph of a 30-year-old Italian-American male baseball player. Athletic build, confident expression, dark hair. Wearing New York baseball uniform. Professional sports photography, 1950s style, black and white." --name "Joe Rosetti" --category "portrait"

# Willie Banks - Baseball pioneer, age ~28
node scripts/generate-image.js "Photorealistic portrait photograph of a 28-year-old African American male baseball player. Dignified, determined expression, athletic build. Wearing Cleveland baseball uniform. Professional sports photography, 1950s style, black and white." --name "Willie Banks" --category "portrait"

# Eddie Lawson - Heavyweight boxing champion, age ~32
node scripts/generate-image.js "Photorealistic portrait photograph of a 32-year-old African American male heavyweight boxer. Powerful build, confident expression, short-cropped hair. Professional boxing portrait, 1950s style, black and white." --name "Eddie Lawson" --category "portrait"

# Rocco Marchetti - Rising boxing contender, age ~25
node scripts/generate-image.js "Photorealistic portrait photograph of a 25-year-old Italian-American male boxer. Young, hungry expression, muscular build, dark hair. Professional boxing portrait, 1950s style, black and white." --name "Rocco Marchetti" --category "portrait"

# Mickey Brennan - Veteran boxer, age 36
node scripts/generate-image.js "Photorealistic portrait photograph of a 36-year-old Irish-American male boxer. Weathered face showing years in the ring, determined expression. Professional boxing portrait, 1950s style, black and white." --name "Mickey Brennan" --category "portrait"
```

### People - Business (6)

```bash
# George Crane - Pioneer Auto founder, age 75
node scripts/generate-image.js "Photorealistic portrait photograph of a 75-year-old white male, distinguished automotive industry pioneer. Silver hair, wise expression, wearing formal dark suit with pocket watch chain. Professional studio lighting, 1950s photography style, black and white." --name "George Crane" --category "portrait"

# Warren Prescott - American Steel president, age 56
node scripts/generate-image.js "Photorealistic portrait photograph of a 56-year-old white male, powerful steel industry executive. Stern authoritative expression, graying hair, wearing expensive dark suit. Professional studio lighting, 1950s photography style, black and white." --name "Warren Prescott" --category "portrait"

# Lawrence Mitchell - Hartwell's CEO, age 48
node scripts/generate-image.js "Photorealistic portrait photograph of a 48-year-old white male, refined department store executive. Polished appearance, sophisticated expression. Wearing impeccable dark suit with silk tie. Professional studio lighting, 1950s photography style, black and white." --name "Lawrence Mitchell" --category "portrait"

# Theodore Hartwell - Hartwell's Chairman, age ~45
node scripts/generate-image.js "Photorealistic portrait photograph of a 45-year-old white male, aristocratic department store chairman. Patrician features, old money elegance. Wearing expensive dark suit. Professional studio lighting, 1950s photography style, black and white." --name "Theodore Hartwell" --category "portrait"

# Josiah Hartwell (historical) - Founder, d.1909
node scripts/generate-image.js "Photorealistic portrait photograph of a 70-year-old white male, Victorian-era department store founder. Stern dignified expression, full white beard. Wearing formal dark suit, 1900s style. Professional studio lighting, period photography style, black and white." --name "Josiah Hartwell" --category "portrait"

# Andrew Dunbar (historical) - Steel founder, d.1924
node scripts/generate-image.js "Photorealistic portrait photograph of a 65-year-old white male, Gilded Age steel magnate. Powerful presence, shrewd expression, bushy mustache. Wearing formal dark suit, 1910s style. Professional studio lighting, period photography style, black and white." --name "Andrew Dunbar" --category "portrait"
```

### People - Other (7)

```bash
# David Salter - Vaccine researcher, age 36
node scripts/generate-image.js "Photorealistic portrait photograph of a 36-year-old white male, dedicated medical researcher. Intelligent expression, wearing white lab coat over dress shirt. Professional medical portrait, 1950s style, black and white." --name "David Salter" --category "portrait"

# Albert Kovar - Rival vaccine researcher, age ~45
node scripts/generate-image.js "Photorealistic portrait photograph of a 45-year-old white male, ambitious medical researcher. Intense competitive expression, wearing white lab coat. Professional medical portrait, 1950s style, black and white." --name "Albert Kovar" --category "portrait"

# Alden Cross - Convicted spy, age 46
node scripts/generate-image.js "Photorealistic portrait photograph of a 46-year-old white male, disgraced State Department official. Gaunt, haunted expression, hollow eyes. Wearing rumpled dark suit. Professional photography, 1950s courtroom style, black and white." --name "Alden Cross" --category "portrait"

# Russell Fletcher - Senator, age 48
node scripts/generate-image.js "Photorealistic portrait photograph of a 48-year-old white male, crusading U.S. Senator. Earnest determined expression, clean-cut appearance. Wearing formal dark suit with American flag pin. Professional Senate portrait style, 1950s, black and white." --name "Russell Fletcher" --category "portrait"

# Richard Tanner - AVL Commander, age 42
node scripts/generate-image.js "Photorealistic portrait photograph of a 42-year-old white male, Marine veteran and veterans organization leader. Strong military bearing, determined expression. Wearing American Veterans League uniform with medals. Professional portrait, 1950s style, black and white." --name "Richard Tanner" --category "portrait"

# Frederick Nash (historical) - AVL founder, d.1948
node scripts/generate-image.js "Photorealistic portrait photograph of a 55-year-old white male, World War I colonel and veterans advocate. Distinguished military bearing, kind but authoritative expression. Wearing military dress uniform with decorations. Professional military portrait, 1940s style, black and white." --name "Frederick Nash" --category "portrait"

# Ernest Beckford - Author, age 51
node scripts/generate-image.js "Photorealistic portrait photograph of a 51-year-old white male, famous American novelist. Rugged weathered face, white beard stubble, intense eyes. Wearing casual safari-style shirt. Professional artistic portrait, 1950s style, black and white." --name "Ernest Beckford" --category "portrait"
```

### Organizations (12)

```bash
# Pinnacle Pictures - Film studio logo
node scripts/generate-image.js "Classic Hollywood film studio logo for Pinnacle Pictures. Art deco mountain peak design with rays of light, elegant 1940s typography. Professional logo design, crisp edges, full color." --name "Pinnacle Pictures Logo" --category "logo" --style logo

# Pioneer Automobile Company - Corporate logo
node scripts/generate-image.js "Classic American automobile company logo for Pioneer Automobile Company. Art deco design with stylized P and automotive wings motif, 1940s typography. Professional logo design, chrome and red color scheme." --name "Pioneer Automobile Logo" --category "logo" --style logo

# American Steel Corporation - Corporate logo
node scripts/generate-image.js "Industrial corporation logo for American Steel Corporation. Bold art deco design with stylized steel beam and flame motif, strong 1940s typography. Professional logo design, red and black color scheme." --name "American Steel Logo" --category "logo" --style logo

# Hartwell's - Department store (use Gemini for text)
node scripts/generate-image.js "Elegant department store exterior photograph showing Hartwell's flagship store. Grand neoclassical building with 'HARTWELL'S' signage, revolving doors, well-dressed shoppers. 1950s Philadelphia, black and white." --name "Hartwells Store" --category "location" --tool gemini

# American Veterans League - Organization logo
node scripts/generate-image.js "Veterans organization emblem for American Veterans League. Patriotic design with eagle, American flag colors, military laurel wreath. Professional emblem design, red white and blue." --name "AVL Emblem" --category "logo" --style logo

# United League Baseball - League logo
node scripts/generate-image.js "Professional baseball league logo for United League Baseball. Classic 1940s design with baseball, crossed bats, bold ULB lettering. Red white and blue color scheme, professional sports logo." --name "ULB Logo" --category "logo" --style logo

# New England University - University crest
node scripts/generate-image.js "Ivy League university crest for New England University. Classical academic shield design with Latin motto, books and lamp of knowledge, founded 1636. Professional heraldic design, crimson and white." --name "New England University Crest" --category "logo" --style logo

# New England University Medical School - Institution logo
node scripts/generate-image.js "Medical research institute logo for New England University Medical School. Professional medical emblem with caduceus, scientific imagery, established 1895. Blue and white color scheme, professional design." --name "New England University Medical School Logo" --category "logo" --style logo

# Hartwell Medical Institute - Institution logo
node scripts/generate-image.js "Medical research institute logo for Hartwell Medical Institute. Professional medical emblem with microscope and flame of discovery, Steel City. Blue and gold color scheme, professional design." --name "Hartwell Medical Logo" --category "logo" --style logo

# National Foundation for Child Health - Foundation logo
node scripts/generate-image.js "Charitable foundation logo for National Foundation for Child Health. Warm caring design with stylized children and protective hands, 1940s style. Blue and gold color scheme, professional design." --name "NFCH Logo" --category "logo" --style logo

# Fletcher Committee - Government seal
node scripts/generate-image.js "U.S. Senate special committee seal for the Fletcher Committee. Official government design with scales of justice and gavel, 1950. Professional governmental seal design, blue and gold." --name "Fletcher Committee Seal" --category "logo" --style logo
```

### Cities (2)

```bash
# Steel City - Industrial cityscape
node scripts/generate-image.js "Photorealistic photograph of Steel City skyline, 1950s. Massive steel mills with smokestacks, industrial waterfront along river, downtown skyscrapers in background. Professional architectural photography, black and white." --name "Steel City Skyline" --category "location"

# Capital City - Government district
node scripts/generate-image.js "Photorealistic photograph of Capital City, 1950s. Grand neoclassical government buildings, wide tree-lined avenues, Capitol dome visible in distance. Professional architectural photography, black and white." --name "Capital City" --category "location"
```

### Brands (3)

```bash
# Pioneer brand - Car badge
node scripts/generate-image.js "1950s automobile hood ornament and badge for Pioneer brand. Chrome art deco design with stylized P and wings. Professional product photography, chrome finish, full color." --name "Pioneer Badge" --category "product" --style product

# Falcon brand - Car badge
node scripts/generate-image.js "1950s automobile hood ornament and badge for Falcon brand. Chrome art deco design with stylized falcon bird in flight. Professional product photography, chrome finish, full color." --name "Falcon Badge" --category "product" --style product

# Crestwood brand - Car badge
node scripts/generate-image.js "1950s luxury automobile hood ornament and badge for Crestwood brand. Elegant chrome design with crown and crest motif. Professional product photography, chrome finish, full color." --name "Crestwood Badge" --category "product" --style product
```

### TV Series & Comic (3)

```bash
# The Dusty Dalton Show - TV promotional still
node scripts/generate-image.js "1950s television promotional photograph for The Dusty Dalton Show. Western TV set with cowboy star in costume, studio lighting visible, early television production. Professional publicity photo, black and white." --name "Dusty Dalton Show" --category "media"

# The Uncle Ned Show - TV promotional still
node scripts/generate-image.js "1950s children's television promotional photograph for The Uncle Ned Show. Friendly host in cardigan on colorful set with puppets and props, early television production. Professional publicity photo, black and white." --name "Uncle Ned Show" --category "media"

# Bramblewood - Comic strip panel
node scripts/generate-image.js "Comic strip panel from Bramblewood by Walter Hendricks. Gentle woodland animals (rabbit, fox, owl) in pastoral forest setting. Clean ink linework, newspaper comic strip style, 1950s. Black and white newspaper print." --name "Bramblewood Comic" --category "media"
```

### Brightway Shows (4)

```bash
# Oklahoma Wind - Show poster (use Gemini for text)
node scripts/generate-image.js "Brightway theatrical poster for Oklahoma Wind, 1943. Western prairie scene with couple, romantic musical imagery, 'OKLAHOMA WIND' title. Vintage theatrical poster art, full color." --name "Oklahoma Wind Poster" --category "media" --tool gemini

# Prairie Carousel - Show poster (use Gemini for text)
node scripts/generate-image.js "Brightway theatrical poster for Prairie Carousel, 1945. New England coastal town scene, carnival carousel imagery, 'PRAIRIE CAROUSEL' title. Vintage theatrical poster art, full color." --name "Prairie Carousel Poster" --category "media" --tool gemini

# Annie of the West - Show poster (use Gemini for text)
node scripts/generate-image.js "Brightway theatrical poster for Annie of the West, 1946. Wild West sharpshooter woman with rifle, Buffalo Bill show imagery, 'ANNIE OF THE WEST' title. Vintage theatrical poster art, full color." --name "Annie of the West Poster" --category "media" --tool gemini

# Pacific Moon - Show poster (use Gemini for text)
node scripts/generate-image.js "Brightway theatrical poster for Pacific Moon, 1949. Tropical Pacific island scene, World War II romance imagery, 'PACIFIC MOON' title. Vintage theatrical poster art, full color." --name "Pacific Moon Poster" --category "media" --tool gemini
```

---

### Image Generation Status

| Category | Count | Status |
|----------|-------|--------|
| People - Entertainment | 6 | [x] DONE |
| People - Sports | 5 | [x] DONE |
| People - Business | 6 | [x] DONE |
| People - Other | 7 | [x] DONE |
| Organizations | 11 | [x] DONE |
| Cities | 2 | [x] DONE |
| Brands | 3 | [x] DONE |
| TV/Comic | 3 | [x] DONE |
| Brightway | 4 | [x] DONE |
| **Total** | **47** | **COMPLETE** |

*Note: Images are stored in database and Vercel Blob. Article infoboxes need to be updated with image URLs.*

# KempoNet Design Patterns

This document defines the consistent design patterns used across all KempoNet sites.

---

## 1. Three Viewing Contexts

All KempoNet pages support three viewing contexts:

| Context | URL Parameter | Description |
|---------|---------------|-------------|
| **KempoNet Browser** | `?kemponet=1` | Embedded in PC simulator iframe |
| **Mobile** | `?mobile=1` | Embedded in phone frame |
| **Direct/Expanded** | (none) | Accessed directly via URL |

```typescript
const isEmbedded = isKempoNet || isMobile
```

---

## 2. State Initialization (Flash Prevention)

To prevent layout flash during hydration, always initialize `isEmbedded` as `true`:

```typescript
const [isEmbedded, setIsEmbedded] = useState(true) // Assume embedded initially
const [isKempoNet, setIsKempoNet] = useState(false)
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const kempoNet = params.get("kemponet") === "1"
  const mobile = params.get("mobile") === "1"
  setIsKempoNet(kempoNet)
  setIsMobile(mobile)
  setIsEmbedded(kempoNet || mobile)
}, [])
```

**Rationale**: Pages are most commonly viewed embedded. Starting with `isEmbedded=true` prevents the flash of showing the direct-access layout while hydration completes.

---

## 3. Header Positioning

Headers use sticky positioning with context-aware offset:

```typescript
<header className={`sticky z-40 ${isEmbedded ? 'top-0' : 'top-14'}`}>
```

| Context | Position | Reason |
|---------|----------|--------|
| Embedded | `top-0` | No main nav above |
| Direct | `top-14` | Offset for 56px main nav |

**Key values**:
- Main nav height: 56px (`top-14`)
- Header z-index: `z-40`
- Fullscreen overlay z-index: `z-[100]`

---

## 4. Parameter Preservation

When navigating between pages, preserve the context parameters:

```typescript
const navigateTo = (path: string) => {
  const extraParams = [
    isKempoNet ? 'kemponet=1' : '',
    isMobile ? 'mobile=1' : '',
  ].filter(Boolean).join('&')
  const suffix = extraParams ? `?${extraParams}` : ''
  router.push(`${path}${suffix}`)
}
```

**Note**: For URLs with existing query params, use `&` instead of `?` for the suffix.

---

## 5. Layout Patterns

### Fullscreen Apps (FlipFlop, SoundWaves)

Fill entire viewport, no scrolling:

```typescript
// Embedded: full screen
// Direct: fixed below nav
const containerClass = isEmbedded
  ? "h-screen"
  : "fixed top-14 left-0 right-0 bottom-0"
```

### Standard Pages (Giggle, Kempopedia, Corporate)

Scrollable content with sticky header:

```typescript
<div className="min-h-screen">
  <header className={`sticky z-40 ${isEmbedded ? 'top-0' : 'top-14'}`}>
    {/* Header content */}
  </header>
  <main className="max-w-2xl mx-auto px-4">
    {/* Page content */}
  </main>
</div>
```

### Pages Without Sticky Headers

Use padding offset instead:

```typescript
<div className={`min-h-screen ${isEmbedded ? 'pt-6' : 'pt-14'}`}>
```

---

## 6. Color Themes

| Site | Background | Accent | Theme |
|------|------------|--------|-------|
| FlipFlop | Black | Pink `#ec4899` | Dark |
| SoundWaves | Black | Purple `#7c3aed` | Dark |
| KempoTube | Black | Orange `#f97316` | Dark |
| Giggle | White | Orange `#f97316` | Light |
| Kempopedia | White | Orange `#f97316` | Light |
| Corporate | Cream `#f5f5f0` | Blue `#1e40af` | Light |

---

## 7. Component Structure

Standard page component structure:

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PageName() {
  const router = useRouter()

  // 1. State declarations (isEmbedded initialized to true)
  const [isEmbedded, setIsEmbedded] = useState(true)
  const [isKempoNet, setIsKempoNet] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [data, setData] = useState([])

  // 2. Context detection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const kempoNet = params.get("kemponet") === "1"
    const mobile = params.get("mobile") === "1"
    setIsKempoNet(kempoNet)
    setIsMobile(mobile)
    setIsEmbedded(kempoNet || mobile)
  }, [])

  // 3. Data fetching
  useEffect(() => {
    fetch("/api/endpoint")
      .then(res => res.json())
      .then(setData)
  }, [])

  // 4. Navigation handler
  const navigateTo = (path: string) => {
    const extraParams = [
      isKempoNet ? 'kemponet=1' : '',
      isMobile ? 'mobile=1' : '',
    ].filter(Boolean).join('&')
    const suffix = extraParams ? `?${extraParams}` : ''
    router.push(`${path}${suffix}`)
  }

  // 5. Render
  return (
    <div className="min-h-screen">
      <header className={`sticky z-40 ${isEmbedded ? 'top-0' : 'top-14'}`}>
        {/* Header */}
      </header>
      <main>
        {/* Content */}
      </main>
    </div>
  )
}
```

---

## 8. Layout Wrappers

All KempoNet pages use a layout with KempoNetBridge:

```typescript
import { Suspense } from "react"
import { KempoNetBridge } from "@/components/KempoNetBridge"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <KempoNetBridge />
      </Suspense>
      {children}
    </>
  )
}
```

---

## 9. Key CSS Classes Reference

| Purpose | Class |
|---------|-------|
| Sticky header | `sticky z-40 top-0` or `top-14` |
| Full page container | `min-h-screen` |
| Content width | `max-w-2xl mx-auto` |
| Fullscreen overlay | `fixed inset-0 z-[100]` |
| Fullscreen app (embedded) | `h-screen` |
| Fullscreen app (direct) | `fixed top-14 left-0 right-0 bottom-0` |

---

## 10. Checklist for New KempoNet Pages

- [ ] Add `"use client"` directive
- [ ] Initialize `isEmbedded` as `true` to prevent flash
- [ ] Detect context params in `useEffect`
- [ ] Use sticky header with conditional `top-0`/`top-14`
- [ ] Implement `navigateTo` helper for param preservation
- [ ] Add layout.tsx with KempoNetBridge wrapper
- [ ] Test in all three contexts (direct, kemponet, mobile)

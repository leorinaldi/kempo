# Claude Instructions for Kempo Project

## Project Documentation

Before making changes to KempoNet pages, read:
- **[docs/kemponet-design-patterns.md](docs/kemponet-design-patterns.md)** - Design system for all KempoNet sites

## Quick Reference

### KempoNet Pages Must:

1. **Initialize `isEmbedded` as `true`** to prevent layout flash:
   ```typescript
   const [isEmbedded, setIsEmbedded] = useState(true)
   ```

2. **Use sticky headers with context-aware offset**:
   ```typescript
   className={`sticky z-40 ${isEmbedded ? 'top-0' : 'top-14'}`}
   ```

3. **Preserve URL params when navigating**:
   ```typescript
   const extraParams = [
     isKempoNet ? 'kemponet=1' : '',
     isMobile ? 'mobile=1' : '',
   ].filter(Boolean).join('&')
   ```

4. **Test in all three contexts**: direct access, `?kemponet=1`, `?mobile=1`

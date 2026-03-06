# Projekt: Zoney — Educational Sales Site

**Repozytorium:** [szachmacik/educational-sales-site](https://github.com/szachmacik/educational-sales-site)  
**Klient:** Kamila  
**Status:** Produkcja — `kamila.ofshore.dev` (Coolify), `kamilaenglish.ofshore.dev` DNS gotowy  
**Stack:** Next.js 15.5.12, TypeScript strict, TailwindCSS, Supabase, Stripe, Vitest  
**Ostatnia aktualizacja:** 2026-03-06

---

## Opis projektu

Sklep edukacyjny Zoney — platforma sprzedaży materiałów do nauki angielskiego (SpeakBook, Mega Pack, kursy). Obsługuje 25 języków przez custom i18n middleware, zawiera panel admina, dashboard ucznia, system płatności Stripe, koszyk i system poleceń.

## Metryki jakości (2026-03-06)

| Metryka | Wartość |
|---------|---------|
| Build | ✓ Pass (950 stron) |
| TypeScript errors | 0 (strict mode) |
| ESLint errors | 0 |
| @ts-ignore | 0 |
| npm CVE | 0 |
| Testy Vitest | 87/87 (100%) |
| Obrazy | 7 MB (było 80 MB, −91%) |

## Architektura

```
app/
  [lang]/           # 25 języków (pl, en, uk, de, es, fr, it, cs, sk, ro, hu, pt, lt, lv, et, hr, sr, sl, bg, el, nl, sv, fi, no, da)
    products/       # Sklep
    dashboard/      # Panel ucznia
    admin/          # Panel admina (chroniony rolą)
    pay/[slug]/     # Checkout
    login/          # Auth
components/
  product/          # Karty produktów, szczegóły
  course/           # Quiz, materiały kursu
  legal/            # Cookie consent, polityki
lib/
  product-catalog.ts  # Katalog produktów (statyczny)
  product-service.ts  # Serwis produktów z filtrowaniem
  translations/       # Tłumaczenia dla 25 języków
  cart-context.tsx    # Koszyk (React Context)
hooks/              # 7 custom hooks
__tests__/          # 87 testów Vitest
middleware.ts       # i18n routing + auth protection
```

## Historia napraw i ulepszeń

### TypeScript (2026-03-04)

| Plik | Problem | Rozwiązanie |
|------|---------|-------------|
| `components/course/quiz-view.tsx` | `t` undefined | Dodano `const { t } = useLanguage()` |
| `components/in-app-notifications.tsx` | `t` undefined | Dodano `const { t } = useLanguage()` |
| `components/language-switcher.tsx` | `t` missing | Dodano `t` do destructuring |
| `components/legal/cookie-consent-bar.tsx` | `ShieldCheck`, `Settings` not imported | Dodano do importu |
| `components/products.tsx` | Konflikt `toast` (sonner vs useToast) | `toast as toastSonner` |
| `components/product/product-detail-view.tsx` | Konflikt `toast` | `toast as toastSonner` |

### Bezpieczeństwo (2026-03-04 → 2026-03-05)

- Next.js 15.3.3 → 15.5.12 (CVE fix)
- Rate limiting: `/api/nip-lookup` (10/min), `/api/telemetry` (30/min) via upstash/ratelimit
- Admin auth: `requireAdmin()` na `/api/scrape`
- Input sanitization w contact API
- Security headers w `next.config.mjs` (CSP, HSTS, X-Frame-Options)

### Wydajność (2026-03-04)

- PNG → JPEG (quality=85, max 1200px): 80MB → 7MB (−91%)
- Lazy-loaded marketing scripts (FOMO, exit-intent)
- Skrypt: `optimize_images.py`

### UX / Proxy fix (2026-03-04)

- `useScrollReveal` startował z `isVisible: false` — niewidoczny przez proxy Manus
- Rozwiązanie: `isVisible: true` jako stan początkowy w `hooks/use-intersection.ts`

### SEO (2026-03-05)

- Organization + WebSite JSON-LD schema w `app/layout.tsx`
- Dynamiczny `sitemap.ts` (950 URL)
- Naprawiony `robots.txt`

### Accessibility (2026-03-05)

- Skip-to-content link
- aria-labels na interaktywnych elementach
- WCAG 2.1 AA compliance

### Testy Vitest (2026-03-06)

- 87 testów: rate-limit, slugify, currency, order-schema, utils, hooks
- Konfiguracja: `vitest.config.ts` z path aliases

### Loading/Error states (2026-03-06)

- 76 plików (loading.tsx + error.tsx) dla 38 stron
- Generator: `generate-loading-error.py`

### Custom hooks (2026-03-06)

- `useDebounce`, `useLocalStorage`, `useMediaQuery`
- `useOnClickOutside`, `useIntersectionObserver`
- `useKeyPress`, `useCountdown`

## Konfiguracja środowiskowa

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_BASE_URL=https://kamila.ofshore.dev
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## Deployment

### Coolify (produkcja) — kamila.ofshore.dev ✅

Projekt wymaga SSR (middleware i18n + auth) — nie może być static export. Cloudflare Pages nie obsługuje.

### kamilaenglish.ofshore.dev — DNS gotowy, czeka na Coolify

DNS A record skonfigurowany. Właściciel musi dodać nową aplikację w Coolify z tego samego repo.

### Lokalne uruchomienie

```bash
cd /home/ubuntu/zoney-shop
npm install
npm run dev   # http://localhost:3000
npm run build # produkcja
npm test      # 87 testów
```

## Ważne wzorce do zapamiętania

### Toast conflict (Sonner vs useToast)

```typescript
// Gdy oba są importowane w tym samym pliku:
import { toast as toastSonner } from 'sonner'
import { useToast } from '@/hooks/use-toast'
// Użyj toastSonner() zamiast toast()
```

### i18n middleware pattern

Middleware w `middleware.ts` obsługuje routing dla 25 języków. Każda strona jest pod `/[lang]/...`. Domyślny język (pl) nie ma prefiksu w URL.

### Rate limiting pattern

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})
```

## Linki

- Live: https://kamila.ofshore.dev
- GitHub: https://github.com/szachmacik/educational-sales-site
- Google Drive: https://drive.google.com/open?id=1Et3ALwxyJfVFF-sxCMRanZcWGJ_0sqAt
- Commit: e3ad273

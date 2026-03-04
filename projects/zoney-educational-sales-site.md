# Projekt: Zoney — Educational Sales Site

**Repozytorium:** [szachmacik/educational-sales-site](https://github.com/szachmacik/educational-sales-site)  
**Klient:** Kamila (kamila.ofshore.dev)  
**Status:** Aktywny — produkcja na Manus Space, docelowo `kamilaenglish.ofshore.dev`  
**Stack:** Next.js 15, TypeScript, TailwindCSS, Supabase, Sonner, Lucide React

---

## Opis projektu

Sklep edukacyjny dla Zoney — platforma sprzedaży materiałów edukacyjnych (SpeakBook, Mega Pack, kursy językowe). Obsługuje 25 języków przez i18n middleware, zawiera panel admina, dashboard ucznia, system płatności i koszyk.

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
middleware.ts         # i18n routing + auth protection
```

## Naprawione błędy (2026-03-04)

### 1. TypeScript — brakujące importy i zmienne

| Plik | Problem | Rozwiązanie |
|------|---------|-------------|
| `components/course/quiz-view.tsx` | `t` undefined | Dodano `const { t } = useLanguage()` |
| `components/in-app-notifications.tsx` | `t` undefined | Dodano `const { t } = useLanguage()` |
| `components/language-switcher.tsx` | `t` missing from destructuring | Dodano `t` do `const { t, language } = useLanguage()` |
| `components/legal/cookie-consent-bar.tsx` | `ShieldCheck`, `Settings` not imported | Dodano do importu z `lucide-react` |
| `components/products.tsx` | Konflikt `toast` (sonner vs useToast) | Zmieniono na `toast as toastSonner` |
| `components/product/product-detail-view.tsx` | Konflikt `toast` (sonner vs useToast) | Zmieniono na `toast as toastSonner` |

### 2. Bezpieczeństwo — Next.js CVE

- **Problem:** Next.js 15.3.3 miał podatność bezpieczeństwa (CVE)
- **Rozwiązanie:** Zaktualizowano do Next.js 15.5.12

### 3. Wydajność — rozmiar obrazów

- **Problem:** Obrazy produktów PNG ważyły łącznie 80MB (niektóre po 4-5MB)
- **Rozwiązanie:** Konwersja PNG → JPEG (quality=85, max 1200px), redukcja 80MB → 7MB (91%)
- **Skrypt:** `/home/ubuntu/optimize_images.py`

### 4. UX — scroll-reveal niewidoczny przez proxy

- **Problem:** `useScrollReveal` hook startował z `isVisible: false` — elementy były niewidoczne w środowisku proxy Manus
- **Rozwiązanie:** Zmieniono stan początkowy na `isVisible: true` w `hooks/use-intersection.ts`

## Konfiguracja środowiskowa

Projekt wymaga pliku `.env.local` z:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=https://kamilaenglish.ofshore.dev
```

## Deployment

### Manus Space (tymczasowy)
```bash
cd /home/ubuntu/zoney-shop
npm run build
nohup npm run start -- -p 3000 > /tmp/zoney.log 2>&1 &
```

### Cloudflare Pages (docelowy)
**Problem:** Projekt używa `middleware.ts` z Node.js APIs (cookies, headers) — wymaga SSR, nie można deployować jako static export.

**Opcje:**
1. **Cloudflare Workers + next-on-pages** — wymaga `runtime = 'edge'` we wszystkich trasach, ale projekt używa `fs/promises` i `path` w API routes
2. **GitHub Actions + wrangler** — wymaga scope `workflows` w GitHub token (Manus App nie ma)
3. **Serwer VPS z nginx** — najlepsza opcja dla pełnego SSR

### Podpięcie domeny kamilaenglish.ofshore.dev
1. Uruchom serwer na VPS (port 3000)
2. Skonfiguruj nginx jako reverse proxy
3. W Cloudflare DNS: dodaj A record `kamilaenglish` → IP serwera
4. Włącz Cloudflare proxy (pomarańczowa chmurka)

## Znane ograniczenia

- Projekt **nie obsługuje** Cloudflare Pages Direct Upload (wymaga SSR)
- Wrangler CLI nie działa przez proxy Manus (blokada sieci)
- GitHub App Manus nie ma scope `workflows` — nie można tworzyć GitHub Actions przez CLI

## Linki

- GitHub: https://github.com/szachmacik/educational-sales-site
- Manus Space (tymczasowy): https://3000-icrwly41zhl0vfggxuqme-ba5aa59a.us1.manus.computer/pl
- Cloudflare Pages project: zoney-kamilaenglish.pages.dev

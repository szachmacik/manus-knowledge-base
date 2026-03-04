# Pattern: i18n w Next.js z Middleware (bez next-intl)

## Opis

Lekka implementacja internacjonalizacji w Next.js App Router bez zewnętrznych bibliotek. Używa `middleware.ts` do wykrywania języka i przekierowań, oraz `useLanguage` hooka do dostępu do tłumaczeń.

## Struktura

```
app/
  [lang]/
    page.tsx          # Strona główna
    products/
      page.tsx
    layout.tsx        # Layout z lang param
lib/
  translations/
    pl.ts             # Polskie tłumaczenia
    en.ts             # Angielskie tłumaczenia
    index.ts          # Export wszystkich języków
hooks/
  use-language.ts     # Hook do dostępu do tłumaczeń
middleware.ts         # Routing i18n
```

## Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ['pl', 'en', 'uk', 'de', 'es', 'fr'];
const defaultLocale = 'pl';

function getLocale(request: NextRequest): string {
    // 1. Cookie
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;
    
    // 2. Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
        const preferred = acceptLanguage.split(',')[0].split('-')[0];
        if (locales.includes(preferred)) return preferred;
    }
    
    return defaultLocale;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip static files, API, _next
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }
    
    // Redirect jeśli brak locale w URL
    const hasLocale = locales.some(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
    if (!hasLocale) {
        const locale = getLocale(request);
        return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
    }
    
    // Ustaw cookie z aktualnym locale
    const locale = pathname.split('/')[1];
    const response = NextResponse.next();
    if (locales.includes(locale)) {
        response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 31536000 });
    }
    
    return response;
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)",],
};
```

## Hook useLanguage

```typescript
// hooks/use-language.ts
'use client';
import { useParams } from 'next/navigation';
import { translations } from '@/lib/translations';

type Locale = keyof typeof translations;

export function useLanguage() {
    const params = useParams();
    const lang = (params?.lang as Locale) || 'pl';
    const t = translations[lang] || translations['pl'];
    
    return { t, language: lang };
}
```

## Tłumaczenia

```typescript
// lib/translations/pl.ts
export const pl = {
    nav: {
        home: 'Strona główna',
        products: 'Produkty',
        cart: 'Koszyk',
    },
    hero: {
        title: 'Ucz się angielskiego',
        subtitle: 'z najlepszymi materiałami',
        cta: 'Sprawdź produkty',
    },
    // ...
};

// lib/translations/index.ts
import { pl } from './pl';
import { en } from './en';
export const translations = { pl, en };
export type Translations = typeof pl;
```

## Użycie w komponencie

```typescript
// components/hero.tsx
'use client';
import { useLanguage } from '@/hooks/use-language';

export function Hero() {
    const { t } = useLanguage();
    
    return (
        <section>
            <h1>{t.hero.title}</h1>
            <p>{t.hero.subtitle}</p>
            <button>{t.hero.cta}</button>
        </section>
    );
}
```

## Przełącznik języka

```typescript
// components/language-switcher.tsx
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';

const LANGUAGES = [
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
    const { language } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    
    const switchLanguage = (newLang: string) => {
        // Zamień /pl/... na /en/...
        const newPath = pathname.replace(`/${language}`, `/${newLang}`);
        document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
        router.push(newPath);
    };
    
    return (
        <div>
            {LANGUAGES.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={language === lang.code ? 'active' : ''}
                >
                    {lang.flag} {lang.label}
                </button>
            ))}
        </div>
    );
}
```

## Ograniczenia

- **Nie działa z Cloudflare Pages static export** — middleware wymaga SSR
- Przy 25+ językach tłumaczenia mogą być duże — rozważ lazy loading per język
- `generateStaticParams` dla `[lang]` jest wymagane przy `output: export`

## Projekt referencyjny

Zoney Educational Sales Site: [szachmacik/educational-sales-site](https://github.com/szachmacik/educational-sales-site) — implementacja z 25 językami

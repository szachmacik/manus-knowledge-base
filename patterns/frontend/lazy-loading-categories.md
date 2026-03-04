# Wzorzec: Lazy Loading per Kategoria/Branża

**Źródło:** `integration-hub/client/src/pages/Integrations.tsx`
**Zastosowanie:** Duże katalogi, biblioteki komponentów podzielone na branże/kategorie

## Problem

Ładowanie całego katalogu integracji (33+ serwisów, 8 kategorii) na raz powoduje:
- Duży initial bundle
- Wolne pierwsze ładowanie
- Niepotrzebne dane dla użytkownika który używa tylko 2-3 kategorii

## Rozwiązanie

React.lazy() + Suspense + dynamiczny import per kategoria.

## Snippet — Strona z Lazy Loading

```tsx
// pages/Integrations.tsx
import React, { useState, Suspense, lazy } from "react";

// Każda kategoria to osobny lazy-loaded komponent
const categoryPanels: Record<string, React.LazyExoticComponent<React.FC<CategoryPanelProps>>> = {
  ai:            lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
  database:      lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
  payments:      lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
  marketing:     lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
  analytics:     lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
  devops:        lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
  automation:    lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
  ecommerce:     lazy(() => import("../components/integrations/CategoryPanel").then(m => ({ default: m.CategoryPanel }))),
};

// Skeleton podczas ładowania
function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function Integrations() {
  const [activeCategory, setActiveCategory] = useState("ai");

  const ActivePanel = categoryPanels[activeCategory];

  return (
    <div>
      {/* Tabs — tylko metadane, bez ładowania danych */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={activeCategory === cat.id ? "active" : ""}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lazy loaded panel — ładuje się tylko gdy kliknięto kategorię */}
      {ActivePanel && (
        <Suspense fallback={<CategorySkeleton />}>
          <ActivePanel category={activeCategory} />
        </Suspense>
      )}
    </div>
  );
}
```

## Wariant — Osobne Pliki per Branża

Dla większych projektów gdzie każda branża ma inną logikę:

```
components/integrations/
├── AiPanel.tsx          ← lazy import
├── EcommercePanel.tsx   ← lazy import (shopify, baselinker, allegro)
├── MarketingPanel.tsx   ← lazy import (manychat, sendgrid, mailchimp)
├── PaymentsPanel.tsx    ← lazy import (stripe, przelewy24, paypal)
└── DevOpsPanel.tsx      ← lazy import (vercel, github, cloudflare)
```

```tsx
// Osobne lazy imports dla różnych paneli
const AiPanel = lazy(() => import("../components/integrations/AiPanel"));
const EcommercePanel = lazy(() => import("../components/integrations/EcommercePanel"));

const panels: Record<string, React.LazyExoticComponent<any>> = {
  ai: AiPanel,
  ecommerce: EcommercePanel,
  // ...
};
```

## Preloading na Hover

Opcjonalnie: preloaduj panel gdy użytkownik najedzie na tab (zanim kliknie):

```tsx
function CategoryTab({ id, label, onActivate }: TabProps) {
  const handleMouseEnter = () => {
    // Preload — React.lazy cacheuje wynik
    import(`../components/integrations/${id}Panel`);
  };
  return (
    <button onMouseEnter={handleMouseEnter} onClick={() => onActivate(id)}>
      {label}
    </button>
  );
}
```

## Kiedy Używać

| Scenariusz | Rekomendacja |
|---|---|
| < 5 kategorii, < 20 elementów | Nie potrzeba lazy loading |
| 5-10 kategorii, 20-50 elementów | Lazy loading per kategoria |
| > 10 kategorii lub branże z różną logiką | Osobne pliki per branża |
| Różne role użytkowników (admin/user) | Lazy loading per rola |

# Loading i Error States dla Next.js App Router

## loading.tsx — Skeleton dla strony

```tsx
// app/[lang]/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="min-h-screen">
      {/* Header placeholder */}
      <div className="h-20 bg-background border-b" />
      
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Title skeleton */}
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-8 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## error.tsx — Error Boundary

```tsx
// app/[lang]/products/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Products page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Coś poszło nie tak</h2>
        <p className="text-muted-foreground text-sm">
          Nie udało się załadować produktów. Spróbuj ponownie.
        </p>
        <Button onClick={reset}>Spróbuj ponownie</Button>
      </div>
    </div>
  )
}
```

## Gdzie dodać loading.tsx i error.tsx

```
app/
  [lang]/
    loading.tsx          ← strona główna
    error.tsx            ← strona główna
    products/
      loading.tsx        ← lista produktów
      error.tsx          ← lista produktów
    blog/
      loading.tsx        ← blog
    dashboard/
      loading.tsx        ← dashboard
    checkout/
      loading.tsx        ← checkout
```

## Uwagi

- `loading.tsx` jest automatycznie używany przez Next.js jako Suspense fallback
- `error.tsx` musi być `'use client'` — obsługuje błędy runtime
- `global-error.tsx` w `app/` obsługuje błędy w root layout

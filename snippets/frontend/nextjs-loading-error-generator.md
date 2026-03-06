# Next.js Loading & Error States — Generator Pattern

Automatyczne generowanie plików `loading.tsx` i `error.tsx` dla wszystkich stron w Next.js App Router.

## Problem

Next.js App Router wymaga pliku `loading.tsx` i `error.tsx` w każdym folderze z `page.tsx`, aby zapewnić loading states i error boundaries. Ręczne tworzenie tych plików dla dziesiątek stron jest czasochłonne.

## Rozwiązanie — Python generator

```python
#!/usr/bin/env python3
"""
Generator plików loading.tsx i error.tsx dla Next.js App Router.
Uruchom z katalogu głównego projektu Next.js.
"""

import os
import sys
from pathlib import Path

LOADING_TEMPLATE = '''"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
'''

ERROR_TEMPLATE = '''"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
      <h2 className="text-2xl font-bold">Coś poszło nie tak</h2>
      <p className="text-muted-foreground max-w-md">
        Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub wróć do strony głównej.
      </p>
      <Button onClick={reset} variant="default">
        Spróbuj ponownie
      </Button>
    </div>
  )
}
'''

def generate_files(app_dir: str, dry_run: bool = False) -> tuple[int, int]:
    """Generuje loading.tsx i error.tsx dla wszystkich stron."""
    created = 0
    skipped = 0
    
    for root, dirs, files in os.walk(app_dir):
        # Pomiń foldery API i prywatne
        dirs[:] = [d for d in dirs if not d.startswith('_') and d != 'api']
        
        if 'page.tsx' not in files and 'page.ts' not in files:
            continue
            
        for filename, template in [('loading.tsx', LOADING_TEMPLATE), ('error.tsx', ERROR_TEMPLATE)]:
            filepath = os.path.join(root, filename)
            if os.path.exists(filepath):
                skipped += 1
                continue
            if not dry_run:
                with open(filepath, 'w') as f:
                    f.write(template)
            created += 1
            print(f"{'[DRY RUN] ' if dry_run else ''}Created: {filepath}")
    
    return created, skipped

if __name__ == '__main__':
    app_dir = sys.argv[1] if len(sys.argv) > 1 else 'app'
    dry_run = '--dry-run' in sys.argv
    
    created, skipped = generate_files(app_dir, dry_run)
    print(f"\nDone: {created} created, {skipped} skipped")
```

## Użycie

```bash
# Dry run (podgląd bez tworzenia plików)
python3 generate-loading-error.py app --dry-run

# Generowanie plików
python3 generate-loading-error.py app

# Dla projektu z [lang] routing
python3 generate-loading-error.py app/[lang]
```

## Wynik

Dla projektu z 38 stronami: 76 plików (38 × loading.tsx + 38 × error.tsx).

## Dostosowanie szablonów

Szablony można dostosować do projektu — np. dodać tłumaczenia, zmienić skeleton layout, lub użyć custom komponentów błędu.

## Źródło

Wzorzec z projektu Zoney (educational-sales-site) — 38 stron, 76 plików wygenerowanych automatycznie.

# Vitest Setup dla Next.js (App Router)

## Kiedy używać
Gdy projekt Next.js nie ma testów i chcesz dodać unit testy dla funkcji lib/.

## Instalacja

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Konfiguracja (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

## Setup file (vitest.setup.ts)

```typescript
import '@testing-library/jest-dom'
```

## Skrypty w package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Struktura testów

```
__tests__/
  lib/
    rate-limit.test.ts    # testy funkcji pomocniczych
    slugify.test.ts
    currency.test.ts
    order-schema.test.ts
    utils.test.ts
  components/
    header.test.tsx       # testy komponentów React
```

## Wzorzec testu dla funkcji lib/

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/my-module'

describe('myFunction', () => {
  it('does what it should', () => {
    expect(myFunction('input')).toBe('expected output')
  })
})
```

## Uwagi

- Używaj unikalnych identyfikatorów w testach rate-limit (np. `${Date.now()}-${testName}`) żeby uniknąć state leakage między testami
- `generateOrderId()` używa `Date.now()` — może zwrócić ten sam ID w tym samym ms; testuj format zamiast unikalności
- Dla komponentów z `useRouter` lub `useSearchParams` — mockuj je przez `vi.mock('next/navigation', ...)`

## Projekt referencyjny
`szachmacik/educational-sales-site` — commit `e3ad273`
57 testów, 5 plików, 100% pass rate

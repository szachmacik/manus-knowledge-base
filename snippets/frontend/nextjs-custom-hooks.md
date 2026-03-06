# Custom React Hooks — Next.js Pattern

Zestaw gotowych custom hooks do wielokrotnego użycia w projektach Next.js. Wszystkie hooks są napisane w TypeScript i nie mają zewnętrznych zależności.

## useDebounce

Opóźnia aktualizację wartości — przydatne do wyszukiwania i filtrowania.

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// Użycie:
const debouncedSearch = useDebounce(searchQuery, 500)
```

## useLocalStorage

Persystentny stan w localStorage z SSR-safe fallback.

```typescript
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item))
    } catch (error) {
      console.error(error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

## useMediaQuery

Reaguje na zmiany breakpointów CSS.

```typescript
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// Użycie:
const isMobile = useMediaQuery('(max-width: 768px)')
```

## useOnClickOutside

Wykrywa kliknięcia poza elementem — do zamykania dropdown/modal.

```typescript
import { useEffect, RefObject } from 'react'

export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
```

## useIntersectionObserver

Lazy loading i scroll animations — SSR-safe (startuje z `isVisible: true` dla proxy compatibility).

```typescript
import { useState, useEffect, useRef, RefObject } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  initialVisible?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [RefObject<HTMLDivElement>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', initialVisible = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(initialVisible)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold, rootMargin }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isVisible]
}
```

**Uwaga:** `initialVisible: true` jest ważne dla środowisk proxy (Manus, Cloudflare) gdzie IntersectionObserver może nie działać poprawnie.

## useKeyPress

Reaguje na naciśnięcia klawiszy.

```typescript
import { useState, useEffect } from 'react'

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    const downHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(true)
    }
    const upHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(false)
    }
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [targetKey])

  return keyPressed
}

// Użycie:
const escPressed = useKeyPress('Escape')
```

## useCountdown

Odliczanie czasu — do FOMO bannerów i ofert czasowych.

```typescript
import { useState, useEffect } from 'react'

interface CountdownResult {
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function useCountdown(targetDate: Date): CountdownResult {
  const [timeLeft, setTimeLeft] = useState(targetDate.getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetDate.getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (timeLeft <= 0) return { hours: 0, minutes: 0, seconds: 0, isExpired: true }

  return {
    hours: Math.floor(timeLeft / (1000 * 60 * 60)),
    minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
    isExpired: false,
  }
}
```

## Źródło

Wzorce wyekstrahowane z projektu Zoney (educational-sales-site) podczas optymalizacji kodu.

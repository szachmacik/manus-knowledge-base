# Fix: Scroll-reveal niewidoczny w środowisku proxy/iframe

## Problem

Komponenty używające `IntersectionObserver` (scroll-reveal, lazy loading) mogą być niewidoczne w środowiskach proxy lub iframe (np. Manus Space, preview tools). Elementy startują z `opacity: 0` i nigdy nie przechodzą do `opacity: 1` bo `IntersectionObserver` nie wyzwala się poprawnie.

## Rozwiązanie

Zmień domyślny stan `isVisible` na `true` w hooku `use-intersection.ts`:

```typescript
// hooks/use-intersection.ts

// ❌ Przed — elementy niewidoczne dopóki nie wejdą w viewport
export function useScrollReveal(options = {}) {
  const [isVisible, setIsVisible] = useState(false); // startuje jako niewidoczny
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1, ...options });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return { ref, isVisible };
}

// ✅ Po — elementy widoczne od razu, animacja działa gdy wchodzą w viewport
export function useScrollReveal(options = {}) {
  const [isVisible, setIsVisible] = useState(true); // startuje jako widoczny
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Resetuj do false tylko jeśli element jest poza viewport
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { 
      threshold: 0,
      rootMargin: '50px', // Wczytuj trochę przed wejściem w viewport
      ...options 
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return { ref, isVisible };
}
```

## Alternatywne rozwiązanie — CSS only

Zamiast JavaScript, użyj CSS `@keyframes` z `animation-play-state`:

```css
/* globals.css */
.scroll-reveal {
  opacity: 1; /* Zawsze widoczny */
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* Opcjonalna animacja przy pierwszym renderze */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-reveal-animate {
  animation: fadeInUp 0.6s ease forwards;
}
```

## Kiedy stosować

- Zawsze gdy strona będzie wyświetlana w środowisku proxy/iframe
- W środowiskach testowych i preview
- Gdy `IntersectionObserver` nie jest krytyczny dla UX

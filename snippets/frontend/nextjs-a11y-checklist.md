# Accessibility (a11y) Checklist dla Next.js

## Skip-to-content link (header.tsx)

```tsx
<header>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-medium"
  >
    Przejdź do treści
  </a>
  {/* reszta headera */}
</header>
```

## Main content wrapper (layout.tsx)

```tsx
<div id="main-content" tabIndex={-1} className="outline-none">
  {children}
</div>
```

## Nawigacja z aria-label

```tsx
<nav aria-label="Nawigacja główna" className="...">
  {/* linki */}
</nav>
```

## Przycisk koszyka z dynamicznym aria-label

```tsx
<Link
  href="/cart"
  aria-label={`Koszyk${itemCount > 0 ? ` (${itemCount} produktów)` : ''}`}
>
  <Button aria-label="Koszyk">
    <ShoppingCart aria-hidden="true" />
    {itemCount > 0 && (
      <span aria-hidden="true">{itemCount}</span>
    )}
  </Button>
</Link>
```

## Progress bar — ukryj przed screen readerami

```tsx
<div aria-hidden="true" style={{ width: `${progress}%` }} />
```

## Checklist WCAG 2.1 AA

- [ ] Skip-to-content link
- [ ] Wszystkie `<img>` mają `alt`
- [ ] Ikonki dekoracyjne mają `aria-hidden="true"`
- [ ] Przyciski bez tekstu mają `aria-label`
- [ ] Formularze mają `<label>` dla każdego inputa
- [ ] Fokus widoczny (nie `outline: none` bez alternatywy)
- [ ] Kontrast kolorów min 4.5:1 dla tekstu
- [ ] Nawigacja klawiaturą działa poprawnie
- [ ] `<nav>` ma `aria-label`
- [ ] `<main>` lub `id="main-content"` istnieje

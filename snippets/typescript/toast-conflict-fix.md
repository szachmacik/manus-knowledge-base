# Fix: Konflikt `toast` z Sonner vs `useToast` hook

## Problem

Projekt używa dwóch systemów toastów jednocześnie:
1. `sonner` — biblioteka z metodami `toast.success()`, `toast.error()`
2. `useToast` hook (shadcn/ui) — własny hook z `toast({ title, description })`

Gdy oba są importowane w tym samym pliku, TypeScript zgłasza błąd:
```
error TS2339: Property 'success' does not exist on type '...'
```

## Rozwiązanie

Zmień nazwę importu z `sonner` żeby uniknąć konfliktu:

```typescript
// ❌ Błąd — konflikt nazw
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
const { toast } = useToast(); // nadpisuje import z sonner

// ✅ Poprawnie — alias dla sonner
import { toast as toastSonner } from "sonner";
import { useToast } from "@/hooks/use-toast";
const { toast } = useToast(); // useToast toast dla { title, description }

// Użycie:
toastSonner.success("Sukces!"); // sonner
toast({ title: "Dodano", description: "Produkt dodany do koszyka" }); // useToast
```

## Kiedy używać którego

| Przypadek | System | Kod |
|-----------|--------|-----|
| Prosta wiadomość sukcesu/błędu | sonner | `toastSonner.success("OK")` |
| Toast z tytułem i opisem | useToast | `toast({ title: "...", description: "..." })` |
| Toast z akcją (przycisk) | useToast | `toast({ title: "...", action: <Button> })` |

## Skrypt masowej naprawy

```bash
# Znajdź pliki z konfliktem
grep -rl 'from "sonner"' app/ components/ | xargs grep -l 'useToast'

# Zamień w znalezionych plikach
sed -i 's/import { toast } from "sonner"/import { toast as toastSonner } from "sonner"/' FILE
sed -i 's/toast\.success/toastSonner.success/g' FILE
sed -i 's/toast\.error/toastSonner.error/g' FILE
```

# Pattern: Search + Filter z useMemo

**Źródło:** integration-hub v1.1 (Projects.tsx, AuditLog.tsx, Clients.tsx)  
**Technologie:** React, useMemo, shadcn/ui Input + Select

## Problem
Filtrowanie dużych list po stronie klienta bez zbędnych re-renderów i bez dodatkowych zapytań do API.

## Rozwiązanie

```tsx
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const [searchQ, setSearchQ]           = useState("");
const [filterCategory, setFilterCategory] = useState("");
const [page, setPage]                 = useState(0);

const filtered = useMemo(() => {
  return (items ?? []).filter(item => {
    const matchSearch = !searchQ ||
      item.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQ.toLowerCase());
    const matchCategory = !filterCategory || item.category === filterCategory;
    return matchSearch && matchCategory;
  });
}, [items, searchQ, filterCategory]);

// Reset strony przy zmianie filtrów
const handleSearch = (v: string) => { setSearchQ(v); setPage(0); };
const handleFilter = (v: string) => { setFilterCategory(v); setPage(0); };

// UI
<div className="flex flex-wrap gap-3">
  <div className="relative flex-1 min-w-48">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      value={searchQ}
      onChange={e => handleSearch(e.target.value)}
      placeholder="Szukaj..."
      className="pl-9"
    />
  </div>
  <Select value={filterCategory} onValueChange={handleFilter}>
    <SelectTrigger className="w-44">
      <SelectValue placeholder="Wszystkie kategorie" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Wszystkie</SelectItem>
      {categories.map(c => (
        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

{/* Empty state gdy filtr nie zwraca wyników */}
{!isLoading && items && items.length > 0 && filtered.length === 0 && (
  <EmptyState
    icon={Search}
    message={`Brak wyników dla "${searchQ}"`}
  />
)}
```

## Kluczowe zasady

- `useMemo` z dependencies `[items, searchQ, filterCategory]` — filtrowanie tylko gdy dane się zmieniają
- Rozróżnienie empty state: "brak danych" vs "brak wyników dla filtrów"
- Reset `page` do 0 przy każdej zmianie filtrów
- Filtrowanie po stronie klienta dla list < 1000 elementów; dla większych — przekazać filtry do query
- Przycisk "Wyczyść filtry" gdy aktywne filtry i brak wyników

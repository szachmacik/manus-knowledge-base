# Pattern: Global Search (Cmd+K)

## Źródło
Integration Hub — `/client/src/components/GlobalSearch.tsx`

## Problem
Aplikacja ma wiele encji (klienci, projekty, integracje). Użytkownik potrzebuje szybkiego dostępu bez klikania przez menu.

## Rozwiązanie

```tsx
// Globalny listener klawiatury
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(true);
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);

// Debounced search
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);

const { data } = trpc.search.global.useQuery(
  { query: debouncedQuery },
  { enabled: debouncedQuery.length >= 2 }
);

// Dialog z wynikami
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <Input
      autoFocus
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Szukaj klientów, projektów, integracji..."
    />
    {/* Wyniki pogrupowane */}
    {data?.clients.map(c => <ResultItem key={c.id} icon={Users} label={c.name} href={`/clients/${c.id}`} />)}
    {data?.projects.map(p => <ResultItem key={p.id} icon={FolderOpen} label={p.name} href={`/projects/${p.id}`} />)}
    {data?.integrations.map(i => <ResultItem key={i.id} icon={Plug} label={i.name} href={`/integrations/${i.category}`} />)}
  </DialogContent>
</Dialog>
```

## Backend (tRPC)
```ts
search: {
  global: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      if (input.query.length < 2) return { clients: [], projects: [], integrations: [] };
      return {
        clients: await searchClients(input.query),
        projects: await searchProjects(input.query),
        integrations: await searchCatalog(input.query),
      };
    }),
}
```

## Kluczowe zasady
- Debounce min 300ms żeby nie zalewać backendu
- Min 2 znaki przed wysłaniem zapytania
- Zamknij dialog po kliknięciu wyniku (`setOpen(false)`)
- Pokaż hint "Cmd+K" w headerze aplikacji

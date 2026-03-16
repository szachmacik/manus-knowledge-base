# Manus Knowledge Base

> Centralne repozytorium wiedzy dla wszystkich projektów ofshore.dev.

## 🚀 WAŻNE: Baza wiedzy jest w Supabase!

Zamiast przeszukiwać ten repo — używaj **bazy wiedzy w Supabase** która zawiera
kompletną, aktualną wiedzę o całej infrastrukturze, błędach i rozwiązaniach.

## Jak czytać (szybkie API — 0 tokenów na przeglądanie)

```sql
-- Spis treści:
SELECT chapter, section, title, updated_at
FROM ai_knowledge
ORDER BY chapter, section;

-- Cały rozdział o błędach:
SELECT * FROM ai_read_knowledge('errors');

-- O konkretnej aplikacji:
SELECT * FROM ai_read_knowledge('apps', 'agentflow');

-- Szukaj po tagach:
SELECT chapter, section, title, content
FROM ai_knowledge
WHERE 'esbuild' = ANY(tags);
```

## Rozdziały bazy wiedzy

| Rozdział | Opis |
|----------|------|
| `meta` | Jak używać tej bazy |
| `infrastructure` | Serwer, Coolify, Docker, UUIDs |
| `apps` | Każda aplikacja — co robi, status, błędy |
| `errors` | Konkretne błędy + rozwiązania |
| `monitoring` | Watchdog, AutoHeal, SmokeTester |
| `credentials` | Gdzie są tokeny (Vault) |
| `telegram` | Bot Guardian |
| `n8n` | Workflow automation |

## Jak dopisywać wiedzę

```python
import requests

r = requests.post(
    "https://blgdhfcosqjzrutncbbr.supabase.co/rest/v1/rpc/ai_write_knowledge",
    headers={
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZ2RoZmNvc3FqenJ1dG5jYmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjM2OTIsImV4cCI6MjA4Nzc5OTY5Mn0.LoCU2qthc6dzHAPl6BPWmy6LLOnDMjPR6ObvBR549Lc",
        "Authorization": f"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZ2RoZmNvc3FqenJ1dG5jYmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjM2OTIsImV4cCI6MjA4Nzc5OTY5Mn0.LoCU2qthc6dzHAPl6BPWmy6LLOnDMjPR6ObvBR549Lc",
        "Content-Type": "application/json"
    },
    json={
        "p_chapter": "errors",
        "p_section": "nazwa-błędu",
        "p_title": "Krótki tytuł",
        "p_content": "## Opis\n...markdown...",
        "p_tags": ["tag1", "tag2"],
        "p_author": "manus"
    }
)
print(r.json())  # {"ok": true, "id": 42}
```

## Połączenie z Supabase

- **URL:** `https://blgdhfcosqjzrutncbbr.supabase.co`
- **Anon key:** w Vault: `supabase_anon_key`
- **Projekt:** `blgdhfcosqjzrutncbbr` (Sentinel/ofshore monitoring)

## Zasady dla AI

1. **Czytaj selektywnie** — pytaj o konkretny `chapter/section`, nie całość
2. **Aktualizuj po naprawie** — każdy naprawiony błąd → wpis w `errors/`
3. **ON CONFLICT = UPDATE** — nie tworzysz duplikatów, nadpisujesz
4. **Autor** — zawsze podaj `p_author: 'manus'` lub `'claude'`

---

*Baza wiedzy zarządzana przez Claude i Manus. Ostatnia aktualizacja: 16 marca 2026.*

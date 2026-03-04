# Security Policy

## Co NIGDY nie trafia do tego repozytorium

To repozytorium jest **publiczne**. Poniższe dane są absolutnie zakazane:

| Kategoria | Przykłady |
|---|---|
| Klucze API | `sk-...`, `pk_live_...`, `AKIA...` |
| Hasła i sekrety | Hasła do baz danych, JWT secrets |
| Tokeny OAuth | Access tokens, refresh tokens |
| Dane klientów | Nazwy, emaile, dane osobowe |
| Adresy wewnętrzne | IP serwerów, wewnętrzne URL-e |
| Certyfikaty | SSL certs, SSH private keys |
| `.env` pliki | Jakiekolwiek pliki z wartościami sekretów |

## Co MOŻE trafiać do tego repozytorium

| Kategoria | Zasada |
|---|---|
| Kod | Tak — bez hardcoded sekretów |
| Wzorce | Tak — z placeholderami zamiast wartości |
| Dokumentacja | Tak — opisowa, bez wrażliwych danych |
| Konfiguracje | Tak — tylko struktury, nie wartości |
| Snippety | Tak — z `process.env.KEY_NAME` zamiast wartości |

## Konwencja Placeholderów

W snippetach i przykładach używaj zawsze:

```typescript
// ✅ Dobrze
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;

// ❌ Źle — NIGDY
const apiKey = "sk-abc123...";
const dbUrl = "mysql://user:pass@host/db";
```

Dla URL-i klientów:
```
# ✅ Dobrze
https://[CLIENT_DOMAIN]/api/config/[CLIENT_SLUG]/[PROJECT_SLUG]

# ❌ Źle
https://acme-corp.manus.space/api/config/acme/main-app
```

## Zgłaszanie Problemów

Jeśli znajdziesz przypadkowo opublikowane sekrety:
1. Natychmiast unieważnij klucz w panelu serwisu
2. Usuń commit z historii (`git filter-branch` lub BFG Repo Cleaner)
3. Sprawdź logi dostępu do klucza

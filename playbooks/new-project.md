# Playbook: Nowy Projekt

Krok-po-kroku instrukcja dla każdego nowego projektu webowego.
**Obowiązkowe** — nie pomijaj żadnego kroku.

## Krok 1: Inicjalizacja

```
1. webdev_init_project(project_name="[nazwa]")
2. Utwórz todo.md z listą wszystkich funkcjonalności
3. Przeczytaj skill: integration-hub-standard (ZAWSZE)
```

## Krok 2: Rejestracja w Integration Hub

```
1. Otwórz Integration Hub: https://integration-hub.manus.space
2. Utwórz klienta (jeśli nowy klient) lub użyj istniejącego
3. Utwórz projekt: Projekty → Nowy projekt
   - Nazwa, slug, opis, tech stack
   - Przypisz do klienta
4. Zapisz ID projektu i slug klienta
```

## Krok 3: Zmienne Środowiskowe

```
webdev_request_secrets([
  { key: "INTEGRATION_HUB_URL", description: "URL Integration Hub" },
  { key: "INTEGRATION_HUB_KEY", description: "API key do /api/config" },
  { key: "INTEGRATION_HUB_CLIENT", description: "Slug klienta (np. owner)" },
])
```

## Krok 4: Dodaj hubConfig.ts

```
Skopiuj: /home/ubuntu/skills/integration-hub-standard/templates/hubConfig.ts
Do: server/lib/hubConfig.ts
```

## Krok 5: Sprawdź Katalog Integracji

```
Dla każdej potrzebnej funkcjonalności sprawdź katalog w Integration Hub:
- AI/LLM? → openai, anthropic, gemini
- Płatności? → stripe, przelewy24
- Email/SMS? → sendgrid, twilio
- Analytics? → posthog, google-analytics
- Baza danych? → supabase, planetscale
- Marketing? → manychat, mailchimp
```

## Krok 6: Aktywuj Integracje

```
W Integration Hub → Project Detail → Dodaj integrację
Dla każdej integracji ustaw keySource:
- "owner" → używaj kluczy właściciela (domyślne)
- "client" → używaj kluczy klienta (własne konto)
```

## Krok 7: Sprawdź Wzorce z Knowledge Base

```
Przed pisaniem kodu sprawdź:
- patterns/backend/ → wzorce backendowe
- patterns/frontend/ → wzorce frontendowe
- patterns/security/ → webhooks, auth
- snippets/ → gotowe fragmenty kodu
```

## Krok 8: Buduj Projekt

```
Standardowy workflow:
1. drizzle/schema.ts → pnpm db:push
2. server/db.ts → query helpers
3. server/routers.ts → tRPC procedures
4. client/src/pages/ → UI
5. Testy vitest
```

## Krok 9: Checkpoint i Deploy

```
1. webdev_save_checkpoint(description="...")
2. Kliknij Publish w Management UI
3. Zaktualizuj projects/registry.md w manus-knowledge-base
4. git push do manus-knowledge-base
```

## Krok 10: Aktualizuj Knowledge Base

```
Po zakończeniu projektu dodaj do manus-knowledge-base:
- Nowe wzorce → patterns/
- Nowe snippety → snippets/
- Wpis projektu → projects/registry.md
- git commit + push
```

## Checklist Końcowy

```
[ ] Projekt zainicjowany (webdev_init_project)
[ ] todo.md utworzony
[ ] Projekt zarejestrowany w Integration Hub
[ ] hubConfig.ts dodany do projektu
[ ] Secrets skonfigurowane
[ ] Integracje aktywowane w Integration Hub
[ ] Wzorce z knowledge base sprawdzone
[ ] Testy vitest napisane i przechodzą
[ ] Checkpoint zapisany
[ ] Projekt opublikowany
[ ] projects/registry.md zaktualizowany
[ ] Nowe wzorce dodane do knowledge base
```

# Manus Knowledge Base

> Centralne repozytorium wiedzy dla wszystkich projektów zarządzanych przez Manus AI.
> Zawiera sprawdzone wzorce, snippety, playbooki i rejestr projektów — **bez żadnych sekretów ani kluczy API**.

## Dla Manus AI — Jak Używać Tego Repozytorium

Przy każdym nowym projekcie lub zadaniu, sprawdź najpierw to repozytorium:

```bash
# Sklonuj lub zaktualizuj lokalnie
git clone https://github.com/szachmacik/manus-knowledge-base.git
# lub
git -C /home/ubuntu/manus-knowledge-base pull
```

Następnie przeszukaj odpowiedni katalog zanim zaczniesz pisać kod od zera.

## Struktura

```
manus-knowledge-base/
├── README.md                    ← Ten plik — punkt startowy
├── SECURITY.md                  ← Zasady bezpieczeństwa (co NIE trafia do repo)
│
├── patterns/                    ← Architektoniczne wzorce projektowe
│   ├── backend/                 ← tRPC, Express, API design
│   ├── frontend/                ← React, lazy loading, komponenty
│   ├── security/                ← HMAC webhooks, auth, rate limiting
│   ├── database/                ← Drizzle ORM, migracje, query patterns
│   ├── ai/                      ← LLM integration, agents, prompts
│   └── automation/              ← Cron jobs, sync engines, queues
│
├── snippets/                    ← Gotowe do użycia fragmenty kodu
│   ├── typescript/              ← Utility types, helpers
│   ├── drizzle/                 ← Schema patterns, query helpers
│   ├── trpc/                    ← Router patterns, middleware
│   ├── cron/                    ← Cron job templates
│   ├── webhooks/                ← Webhook handlers z security
│   ├── oauth/                   ← OAuth flows dla różnych platform
│   └── mcp/                     ← MCP server templates
│
├── integrations/                ← Dokumentacja integracji
│   ├── catalog/                 ← Opis każdej integracji (bez kluczy)
│   └── configs/                 ← Przykładowe konfiguracje (z placeholderami)
│
├── projects/                    ← Rejestr wszystkich projektów
│   ├── registry.md              ← Lista projektów z linkami i statusem
│   └── [project-name].md        ← Karta każdego projektu
│
├── skills-registry/             ← Rejestr Manus Skills
│   └── README.md                ← Lista aktywnych skills i ich zastosowanie
│
└── playbooks/                   ← Krok-po-kroku instrukcje dla powtarzalnych zadań
    ├── new-project.md           ← Jak zacząć nowy projekt
    ├── new-client.md            ← Jak dodać klienta do Integration Hub
    ├── deploy-to-manus.md       ← Jak deployować na Manus Spaces
    └── security-audit.md        ← Jak przeprowadzić audit bezpieczeństwa
```

## Zasada Cykliczna

**Każdy nowy projekt MUSI być zarejestrowany w `projects/registry.md`.**
**Każdy nowy wzorzec odkryty w projekcie MUSI być dodany do `patterns/`.**
**Każdy nowy snippet MUSI być dodany do `snippets/`.**

To repozytorium rośnie razem z projektami — jest żywym dokumentem.

## Projekty w Ekosystemie

| Projekt | Typ | Status | GitHub |
|---|---|---|---|
| **integration-hub** | SaaS Config Management | Active | [szachmacik/integration-hub](https://github.com/szachmacik/integration-hub) |
| **ai-control-center** | AI Agent Dashboard | Active | [szachmacik/ai-control-center](https://github.com/szachmacik/ai-control-center) |
| **polaris-track** | E-commerce Analytics | Active | [szachmacik/polaris-track](https://github.com/szachmacik/polaris-track) |
| **educational-sales-site** | EdTech Platform | Active | [szachmacik/educational-sales-site](https://github.com/szachmacik/educational-sales-site) |

## Stack Technologiczny (Standard)

Wszystkie projekty używają tego samego core stacku:

| Warstwa | Technologia |
|---|---|
| Frontend | React 19, Tailwind 4, shadcn/ui, wouter |
| Backend | Express 4, tRPC 11, Superjson |
| Database | Drizzle ORM, MySQL/TiDB |
| Auth | Manus OAuth (JWT, httpOnly cookies) |
| Testing | Vitest |
| Language | TypeScript 5.x |
| Package manager | pnpm |

## Bezpieczeństwo

Patrz [SECURITY.md](./SECURITY.md) — lista tego co NIGDY nie trafia do tego repo.

# Rejestr Projektów

Centralny rejestr wszystkich projektów zarządzanych przez Manus AI.
Aktualizuj ten plik przy każdym nowym projekcie.

## Aktywne Projekty

### integration-hub
**Typ:** SaaS Config Management Platform
**Status:** Active — MVP deployed
**GitHub:** https://github.com/szachmacik/integration-hub (private)
**Manus Spaces:** https://integration-hub.manus.space (po publikacji)
**Stack:** React 19, tRPC 11, Drizzle ORM, MySQL, Express 4
**Opis:** Centralny panel zarządzania integracjami, klientami i kluczami API. Hierarchia konfiguracji owner→client→project. 33 integracje w katalogu. REST endpoint `/api/config/:clientSlug/:projectId`.
**Kluczowe wzorce:** Config Merge Engine, Lazy Loading per Category, Audit Log
**Integration Hub Client:** `owner` (slug)
**Powiązane pliki:**
- `patterns/backend/config-merge-engine.md`
- `patterns/frontend/lazy-loading-categories.md`
- `skills-registry/README.md` (skill: integration-hub-standard)

---

### ai-control-center
**Typ:** AI Agent Dashboard & Monitoring
**Status:** Active
**GitHub:** https://github.com/szachmacik/ai-control-center (private)
**Stack:** React, tRPC, Drizzle ORM, MySQL
**Opis:** Panel zarządzania agentami AI z audit engine, uptime monitoring, security checks. Agenci: monitor, analyzer, optimizer, reporter.
**Kluczowe wzorce:** Audit Engine, AI Agents Pattern, Infrastructure Monitoring
**Integration Hub Client:** `owner`
**Powiązane pliki:**
- `patterns/backend/audit-engine.md`
- `patterns/ai/ai-agents-pattern.md`

---

### polaris-track
**Typ:** E-commerce Analytics & Attribution
**Status:** Active
**GitHub:** https://github.com/szachmacik/polaris-track (private)
**Stack:** React, tRPC, Drizzle ORM, MySQL, node-cron
**Opis:** Tracker e-commerce z synchronizacją danych z Meta Ads, Google Ads, TikTok, ManyChat, Allegro. Cron jobs dla dziennej agregacji. Webhook security (HMAC). Attribution engine.
**Kluczowe wzorce:** Cron Sync Engine, Webhook HMAC Security, OAuth Token Auto-Refresh, Platform Adapters
**Integracje:** Meta Ads, Google Ads, Google Analytics, YouTube, TikTok, ManyChat, Allegro, InPost, Przelewy24
**Integration Hub Client:** `owner`
**Powiązane pliki:**
- `patterns/automation/cron-sync-engine.md`
- `patterns/security/webhook-hmac.md`
- `snippets/oauth/platform-oauth-flows.md`

---

### educational-sales-site
**Typ:** EdTech Platform (Next.js)
**Status:** Active
**GitHub:** https://github.com/szachmacik/educational-sales-site (private)
**Stack:** Next.js, TypeScript, MCP Server (isomorphic-git, googleapis)
**Opis:** Platforma edukacyjna z wielojęzycznym wsparciem (i18n), MCP server do współpracy między agentami (git_sync, gdrive_upload), integracja z Google Drive.
**Kluczowe wzorce:** MCP Server, i18n Multi-language, Google Drive Integration
**Integration Hub Client:** `owner`
**Powiązane pliki:**
- `snippets/mcp/mcp-server-template.md`

---

## Szablon dla Nowego Projektu

Skopiuj i wypełnij przy dodawaniu nowego projektu:

```markdown
### [project-name]
**Typ:** [typ aplikacji]
**Status:** Active / In Development / Archived
**GitHub:** https://github.com/szachmacik/[project-name] (private/public)
**Manus Spaces:** https://[project-name].manus.space
**Stack:** [technologie]
**Opis:** [krótki opis]
**Kluczowe wzorce:** [lista wzorców]
**Integration Hub Client:** [slug klienta w Integration Hub]
**Powiązane pliki:** [linki do patterns/snippets]
```

## Statystyki

| Metryka | Wartość |
|---|---|
| Łączna liczba projektów | 4 |
| Aktywne projekty | 4 |
| Wspólny stack | React + tRPC + Drizzle + MySQL |
| Integracje w katalogu | 33 |

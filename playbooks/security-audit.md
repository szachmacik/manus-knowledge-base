# Playbook: Security Audit

Krok-po-kroku audit bezpieczeństwa dla każdego projektu.
**Uruchamiaj:** przed każdym deployem produkcyjnym i co tydzień.

## Krok 1: Sprawdź Wycieki Sekretów w GitHub

```bash
# Sprawdź czy żadne sekrety nie trafiły do repo
gh secret list
git log --all --full-history -- "*.env" "*.env.*"
git grep -i "sk-\|pk_live_\|AKIA\|password\s*=" -- "*.ts" "*.js" "*.json"
```

Narzędzia do automatycznego skanowania:
- [truffleHog](https://github.com/trufflesecurity/trufflehog): `trufflehog git file://. --only-verified`
- [gitleaks](https://github.com/gitleaks/gitleaks): `gitleaks detect --source .`

## Krok 2: Sprawdź Nagłówki HTTP

```bash
curl -I https://[your-app].manus.space | grep -i "x-frame\|x-content\|strict-transport\|content-security"
```

Wymagane nagłówki:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Krok 3: Sprawdź Webhooki

```
[ ] Każdy endpoint /api/webhooks/* ma weryfikację HMAC
[ ] Używa safeCompare (constant-time) zamiast ===
[ ] Sprawdza świeżość timestamp (replay attack)
[ ] Loguje nieudane weryfikacje
[ ] Raw body parsing przed JSON.parse
```

Patrz: `patterns/security/webhook-hmac.md`

## Krok 4: Sprawdź Auth

```
[ ] JWT secret jest silny (min 32 znaki, losowy)
[ ] Cookies: httpOnly=true, secure=true, sameSite=none (dla cross-origin)
[ ] Brak wrażliwych danych w JWT payload
[ ] protectedProcedure na wszystkich chronionych endpointach
[ ] adminProcedure na operacjach admin
[ ] Brak hardcoded credentials w kodzie
```

## Krok 5: Sprawdź Bazę Danych

```
[ ] Brak SQL injection (używasz Drizzle ORM — jesteś bezpieczny)
[ ] Multi-tenant: każde query filtruje po workspaceId/clientId
[ ] Brak SELECT * w produkcji (tylko potrzebne kolumny)
[ ] Indeksy na często filtrowanych kolumnach
[ ] Backup skonfigurowany
```

## Krok 6: Sprawdź API Keys

```
[ ] Wszystkie klucze w zmiennych środowiskowych (nie w kodzie)
[ ] Klucze w Integration Hub mają odpowiednie uprawnienia (nie full-access)
[ ] Klucze klientów są izolowane (klient A nie widzi kluczy klienta B)
[ ] Rotacja kluczy zaplanowana
```

## Krok 7: Sprawdź Rate Limiting

```
[ ] Endpointy publiczne mają rate limiting
[ ] Auth endpoints (login) mają ograniczenie prób
[ ] Webhook endpoints mają rate limiting
```

## Krok 8: Dependency Audit

```bash
pnpm audit
pnpm outdated
```

## Raport

Po audycie utwórz raport w Google Drive (nie w publicznym repo):

```
Security Audit Report — [projekt] — [data]
- Critical: [lista]
- High: [lista]
- Medium: [lista]
- Low: [lista]
- Fixed: [lista]
```

## Automatyzacja

Audit Engine z `ai-control-center` może automatyzować kroki 2, 4, 5, 7.
Patrz: `patterns/backend/audit-engine.md`

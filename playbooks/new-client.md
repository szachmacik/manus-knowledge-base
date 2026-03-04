# Playbook: Dodawanie Nowego Klienta

Krok-po-kroku workflow dla onboardingu nowego klienta.

## Krok 1: Utwórz Klienta w Integration Hub

W panelu Integration Hub → Klienci → Nowy klient:

```
Nazwa: [Pełna nazwa firmy]
Slug: [nazwa-firmy-lowercase-bez-spacji]
Email: [kontakt@firma.pl]
Plan: Starter (20%) / Pro (30%) / Business (40%) / Enterprise (50%)
```

Lub przez API:
```typescript
await trpc.clients.create.mutate({
  name: "Acme Corp",
  slug: "acme-corp",
  email: "kontakt@acme.pl",
  pricingPlanId: 2, // Pro = 30% marża
});
```

## Krok 2: Ustal Strategię Kluczy

Dla każdej integracji zdecyduj:

| Integracja | Strategia | Uzasadnienie |
|---|---|---|
| OpenAI | `owner` | Klient nie ma własnego konta |
| Stripe | `client` | Klient ma własne konto Stripe |
| SendGrid | `owner` | Używamy wspólnego konta z subkontami |
| Supabase | `client` | Klient chce własną bazę danych |

## Krok 3: Dodaj Klucze Klienta

Dla kluczy klienta (własne konta):

```typescript
// W panelu: Client Detail → Klucze API → Dodaj klucz
await trpc.keys.clientUpsert.mutate({
  clientId: clientId,
  integrationSlug: "stripe",
  keyName: "STRIPE_SECRET_KEY",
  keyValue: "sk_live_...", // klucz klienta
  keySource: "client",
});
```

Dla kluczy dziedziczonych od właściciela:
```typescript
await trpc.keys.clientUpsert.mutate({
  clientId: clientId,
  integrationSlug: "openai",
  keyName: "OPENAI_API_KEY",
  keyValue: "", // puste — będzie użyty klucz właściciela
  keySource: "owner",
});
```

## Krok 4: Utwórz Projekt(y) dla Klienta

```typescript
await trpc.projects.create.mutate({
  clientId: clientId,
  name: "Main App",
  slug: "main-app",
  description: "Główna aplikacja klienta",
  techStack: ["react", "trpc", "drizzle"],
});
```

## Krok 5: Aktywuj Integracje dla Projektu

W panelu: Project Detail → Dodaj integrację

Lub przez API:
```typescript
await trpc.integrations.enable.mutate({
  projectId: projectId,
  integrationSlug: "openai",
  keySource: "owner", // lub "client"
});
```

## Krok 6: Przetestuj Config Endpoint

```bash
curl https://integration-hub.manus.space/api/config/acme-corp/main-app
```

Oczekiwana odpowiedź:
```json
{
  "clientSlug": "acme-corp",
  "projectSlug": "main-app",
  "clientName": "Acme Corp",
  "config": {
    "OPENAI_API_KEY": { "value": "sk-...", "source": "owner" },
    "STRIPE_SECRET_KEY": { "value": "sk_live_...", "source": "client" }
  }
}
```

## Krok 7: Skonfiguruj Projekt Klienta

W projekcie klienta dodaj secrets:
```
INTEGRATION_HUB_CLIENT = "acme-corp"
INTEGRATION_HUB_URL = "https://integration-hub.manus.space"
```

## Kalkulator Kosztów

Sprawdź w Integration Hub → Plany cenowe → Kalkulator:

| Integracja | Koszt bazowy | Marża (30%) | Cena klienta |
|---|---|---|---|
| OpenAI GPT-4 | $20/mies | $6 | $26/mies |
| Supabase Pro | $25/mies | $7.50 | $32.50/mies |
| Stripe | 1.4% + 0.25€ | +0.42% | 1.82% + 0.25€ |

## Checklist Onboardingu

```
[ ] Klient utworzony w Integration Hub
[ ] Plan cenowy przypisany
[ ] Strategia kluczy ustalona
[ ] Klucze klienta dodane (własne lub owner)
[ ] Projekt(y) utworzone
[ ] Integracje aktywowane
[ ] Config endpoint przetestowany
[ ] Projekt klienta skonfigurowany (INTEGRATION_HUB_CLIENT)
[ ] Kalkulator kosztów sprawdzony
```

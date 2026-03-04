# Wzorzec: Config Merge Engine (Hierarchia Konfiguracji)

**Źródło:** `integration-hub/server/db.ts` — `resolveConfig()`
**Zastosowanie:** Multi-tenant SaaS gdzie każdy klient/projekt może nadpisać domyślne ustawienia właściciela

## Koncepcja

```
Owner Defaults → Client Overrides → Project-Specific
     (1)               (2)                (3)
```

Wyższy poziom zawsze wygrywa. Klient widzi tylko swoje klucze — nigdy cudze.

## Snippet — resolveConfig

```typescript
// server/db.ts
export async function resolveConfig(clientSlug: string, projectSlug: string) {
  const db = await getDb();
  if (!db) return null;

  // 1. Znajdź klienta
  const [client] = await db.select().from(clients)
    .where(eq(clients.slug, clientSlug)).limit(1);
  if (!client) return null;

  // 2. Znajdź projekt
  const [project] = await db.select().from(projects)
    .where(and(eq(projects.slug, projectSlug), eq(projects.clientId, client.id))).limit(1);
  if (!project) return null;

  // 3. Pobierz klucze właściciela (poziom 1 — defaults)
  const ownerKeys = await db.select().from(ownerApiKeys);

  // 4. Pobierz klucze klienta (poziom 2 — overrides)
  const clientKeys = await db.select().from(clientApiKeys)
    .where(eq(clientApiKeys.clientId, client.id));

  // 5. Pobierz aktywne integracje projektu (poziom 3 — project-specific)
  const projectIntegrations = await db.select({
    integrationSlug: projectIntegrationTable.integrationSlug,
    keySource: projectIntegrationTable.keySource,
    config: projectIntegrationTable.config,
  }).from(projectIntegrationTable)
    .where(and(
      eq(projectIntegrationTable.projectId, project.id),
      eq(projectIntegrationTable.isActive, true)
    ));

  // 6. Merge: owner → client → project
  const resolved: Record<string, {
    value: string;
    source: "owner" | "client" | "project";
    integrationSlug: string;
    keyName: string;
  }> = {};

  // Poziom 1: Owner keys
  for (const key of ownerKeys) {
    resolved[key.keyName] = {
      value: key.keyValue,
      source: "owner",
      integrationSlug: key.integrationSlug,
      keyName: key.keyName,
    };
  }

  // Poziom 2: Client keys (nadpisują owner)
  for (const key of clientKeys) {
    if (key.keySource === "client") {
      resolved[key.keyName] = {
        value: key.keyValue,
        source: "client",
        integrationSlug: key.integrationSlug,
        keyName: key.keyName,
      };
    }
    // keySource === "owner" → zostaw owner key
  }

  // Poziom 3: Project-specific config (nadpisuje wszystko)
  for (const pi of projectIntegrations) {
    const config = pi.config as Record<string, string> | null;
    if (config) {
      for (const [keyName, value] of Object.entries(config)) {
        resolved[keyName] = {
          value,
          source: "project",
          integrationSlug: pi.integrationSlug,
          keyName,
        };
      }
    }
  }

  return {
    clientSlug,
    projectSlug,
    clientName: client.name,
    projectName: project.name,
    resolvedAt: new Date().toISOString(),
    config: resolved,
  };
}
```

## REST Endpoint

```typescript
// server/_core/index.ts
app.get("/api/config/:clientSlug/:projectId", async (req, res) => {
  const { clientSlug, projectId } = req.params;
  const config = await resolveConfig(clientSlug, projectId);
  if (!config) return res.status(404).json({ error: "Client or project not found" });
  res.json(config);
});
```

## Klient — hubConfig.ts

Patrz: `skills/integration-hub-standard/templates/hubConfig.ts`

## Zastosowania

| Scenariusz | Owner Key | Client Key | Project Key |
|---|---|---|---|
| Klient bez własnego OpenAI | ✅ używany | — | — |
| Klient z własnym OpenAI | ✅ fallback | ✅ używany | — |
| Projekt z dedykowanym kluczem | ✅ fallback | ✅ fallback | ✅ używany |

## Bezpieczeństwo

- Klucze właściciela są nigdy nie zwracane do frontendu — tylko przez `/api/config`
- Endpoint może być zabezpieczony `x-api-key` headerem
- Każdy klient widzi tylko swoje klucze (izolacja przez `clientId`)

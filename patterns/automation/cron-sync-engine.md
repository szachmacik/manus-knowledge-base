# Wzorzec: Cron Jobs i Sync Engine

**Źródło:** `polaris-track/server/cronJobs.ts`, `polaris-track/server/syncEngine.ts`
**Zastosowanie:** Automatyczna synchronizacja danych, agregacja dzienna, monitoring

## Architektura Sync Engine

```
Scheduler (cron) → Job Runner → Platform Adapter → DB
     ↓                ↓               ↓
sync_schedules   sync_jobs      oauthTokens (auto-refresh)
```

## Snippet — Cron Job Template

```typescript
// server/cronJobs.ts
import cron from "node-cron";
import { getDb } from "./db";

// Helpers
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function yesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

export function startCronJobs() {
  // Dzienna agregacja — codziennie o 01:00
  cron.schedule("0 1 * * *", async () => {
    console.log("[Cron] Running daily aggregation...");
    try {
      await aggregateDailySummary(yesterday());
    } catch (err) {
      console.error("[Cron] Daily aggregation failed:", err);
    }
  });

  // Sync platform data — co 15 minut
  cron.schedule("*/15 * * * *", async () => {
    try {
      await runPendingSyncJobs();
    } catch (err) {
      console.error("[Cron] Sync jobs failed:", err);
    }
  });

  // Health check — co godzinę
  cron.schedule("0 * * * *", async () => {
    try {
      await runHealthChecks();
    } catch (err) {
      console.error("[Cron] Health check failed:", err);
    }
  });

  console.log("[Cron] All jobs scheduled");
}
```

## Snippet — OAuth Token Auto-Refresh

```typescript
// Przed każdym API requestem sprawdź czy token nie wygasł
async function getValidToken(db: DB, workspaceId: number, platform: string) {
  const [token] = await db.select().from(oauthTokens)
    .where(and(
      eq(oauthTokens.workspaceId, workspaceId),
      eq(oauthTokens.platform, platform)
    )).limit(1);

  if (!token) throw new Error(`No OAuth token for ${platform}`);

  // Refresh jeśli wygasa w ciągu 5 minut
  if (token.expiresAt && token.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    return await refreshToken(db, token);
  }
  return token;
}

async function refreshToken(db: DB, token: OAuthToken) {
  // Platform-specific refresh logic
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken!,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  });
  const data = await response.json();
  await db.update(oauthTokens)
    .set({ accessToken: data.access_token, expiresAt: new Date(Date.now() + data.expires_in * 1000) })
    .where(eq(oauthTokens.id, token.id));
  return { ...token, accessToken: data.access_token };
}
```

## Snippet — Platform Adapter Pattern

```typescript
// Każda platforma implementuje ten sam interfejs
interface PlatformAdapter {
  platform: string;
  sync(db: DB, workspaceId: number): Promise<{ synced: number; errors: string[] }>;
}

const adapters: Record<string, PlatformAdapter> = {
  meta: {
    platform: "meta",
    async sync(db, workspaceId) {
      const token = await getValidToken(db, workspaceId, "meta");
      // ... fetch and store data
      return { synced: 0, errors: [] };
    }
  },
  // ... inne platformy
};

async function runSyncJob(db: DB, jobId: number, platform: string, workspaceId: number) {
  await db.update(syncJobs).set({ status: "running", startedAt: new Date() })
    .where(eq(syncJobs.id, jobId));
  try {
    const adapter = adapters[platform];
    if (!adapter) throw new Error(`Unknown platform: ${platform}`);
    const result = await adapter.sync(db, workspaceId);
    await db.update(syncJobs).set({
      status: "completed", completedAt: new Date(),
      recordsSynced: result.synced
    }).where(eq(syncJobs.id, jobId));
  } catch (err) {
    await db.update(syncJobs).set({
      status: "failed", completedAt: new Date(),
      errorMessage: String(err)
    }).where(eq(syncJobs.id, jobId));
  }
}
```

## Obsługiwane Platformy (z polaris-track)

| Platforma | OAuth Provider | Scope |
|---|---|---|
| Meta Ads | Facebook OAuth | `ads_read,ads_management` |
| Google Ads | Google OAuth | `adwords` |
| Google Analytics | Google OAuth | `analytics.readonly` |
| YouTube | Google OAuth | `youtube.readonly` |
| TikTok Ads | TikTok OAuth | `ad.read` |
| ManyChat | ManyChat API | API Key |
| Allegro | Allegro OAuth | `allegro:api:orders:read` |

## Drizzle Schema dla Sync Engine

```typescript
export const syncJobs = mysqlTable("sync_jobs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending","running","completed","failed"]).default("pending"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  recordsSynced: int("recordsSynced").default(0),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const oauthTokens = mysqlTable("oauth_tokens", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  platform: varchar("platform", { length: 64 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  scope: text("scope"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

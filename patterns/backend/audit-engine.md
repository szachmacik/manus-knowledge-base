# Wzorzec: Audit Engine

**Źródło:** `ai-control-center/server/auditEngine.ts`, `ai-control-center/server/auditDb.ts`
**Zastosowanie:** Automatyczne audyty bezpieczeństwa, uptime monitoring, dependency checks

## Architektura

```
tRPC mutation / cron → AuditEngine.run(config) → [Checkers] → AuditDB → Findings
```

Każdy checker to **czysta funkcja** — brak efektów ubocznych, łatwa do testowania.

## Typy Audytów

| Typ | Co sprawdza |
|---|---|
| `uptime` | HTTP status, czas odpowiedzi |
| `security` | Nagłówki bezpieczeństwa, HTTPS, CORS |
| `functional` | Kluczowe endpointy, auth flow |
| `dependency` | Wersje pakietów, CVE |
| `db_health` | Połączenie z DB, czas query |

## Snippet — Audit Engine Core

```typescript
// server/auditEngine.ts
export type AuditType = "uptime" | "security" | "functional" | "dependency" | "db_health";

export interface AuditConfig {
  type: AuditType;
  triggeredBy?: string;
  projectIds?: number[];
}

export interface FindingInput {
  auditProjectId?: number;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  code: string;
  title: string;
  description?: string;
  location?: string;
  evidence?: string;
  autoFixed?: boolean;
  fixDescription?: string;
}

// HTTP helper z timeoutem
function httpGet(url: string, timeoutMs = 10000): Promise<{ status: number; elapsed: number }> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request({ hostname: parsed.hostname, path: parsed.pathname, method: "GET" }, (res) => {
      resolve({ status: res.statusCode ?? 0, elapsed: Date.now() - start });
      res.resume();
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error("Timeout")); });
    req.on("error", reject);
    req.end();
  });
}

// Uptime checker
async function runUptimeChecks(projects: AuditProject[]): Promise<FindingInput[]> {
  const findings: FindingInput[] = [];
  for (const project of projects) {
    if (!project.url) continue;
    try {
      const { status, elapsed } = await httpGet(project.url);
      if (status < 200 || status >= 400) {
        findings.push({
          auditProjectId: project.id,
          severity: "critical",
          category: "uptime",
          code: "HTTP_ERROR",
          title: `HTTP ${status} — ${project.name}`,
          location: project.url,
          evidence: `Status: ${status}`,
        });
      } else if (elapsed > 3000) {
        findings.push({
          auditProjectId: project.id,
          severity: "medium",
          category: "uptime",
          code: "SLOW_RESPONSE",
          title: `Slow response — ${project.name}`,
          location: project.url,
          evidence: `${elapsed}ms`,
        });
      }
    } catch (err) {
      findings.push({
        auditProjectId: project.id,
        severity: "critical",
        category: "uptime",
        code: "UNREACHABLE",
        title: `Unreachable — ${project.name}`,
        location: project.url,
        evidence: String(err),
      });
    }
  }
  return findings;
}

// Main runner
export async function runAudit(config: AuditConfig): Promise<{ runId: number; findings: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const projects = await listAuditProjects(config.projectIds);
  const runId = await createAuditRun(config.type, config.triggeredBy);

  let findings: FindingInput[] = [];
  switch (config.type) {
    case "uptime": findings = await runUptimeChecks(projects); break;
    case "security": findings = await runSecurityChecks(projects); break;
    // ...
  }

  await createAuditFindings(runId, findings);
  await completeAuditRun(runId, findings.length);
  return { runId, findings: findings.length };
}
```

## Drizzle Schema

```typescript
export const auditRuns = mysqlTable("audit_runs", {
  id: int("id").autoincrement().primaryKey(),
  auditType: mysqlEnum("auditType", ["uptime","security","functional","dependency","db_health"]).notNull(),
  status: mysqlEnum("status", ["running","completed","failed"]).default("running"),
  triggeredBy: varchar("triggeredBy", { length: 255 }),
  findingsCount: int("findingsCount").default(0),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const auditFindings = mysqlTable("audit_findings", {
  id: int("id").autoincrement().primaryKey(),
  auditRunId: int("auditRunId").notNull(),
  auditProjectId: int("auditProjectId"),
  severity: mysqlEnum("severity", ["critical","high","medium","low","info"]).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: text("location"),
  evidence: text("evidence"),
  autoFixed: boolean("autoFixed").default(false),
  fixDescription: text("fixDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

## Integracja z tRPC

```typescript
// Trigger manualny + cron
audit: router({
  run: adminProcedure
    .input(z.object({ type: z.enum(["uptime","security","functional","dependency","db_health"]) }))
    .mutation(({ input, ctx }) =>
      runAudit({ type: input.type, triggeredBy: ctx.user.email ?? "admin" })
    ),
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(({ input }) => listAuditRuns(input.limit)),
  findings: protectedProcedure
    .input(z.object({ runId: z.number() }))
    .query(({ input }) => getAuditFindings(input.runId)),
}),
```

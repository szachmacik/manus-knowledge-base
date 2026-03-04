# Wzorzec: AI Agents w Aplikacji Webowej

**Źródło:** `ai-control-center/server/routers.ts`, `ai-control-center/server/db.ts`
**Zastosowanie:** Zarządzanie agentami AI, task queue, monitoring statusu

## Architektura

```
User → tRPC mutation → Agent Runner → LLM (invokeLLM) → Result → DB
                            ↓
                       Audit Log
```

## Drizzle Schema — Agents

```typescript
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["monitor","analyzer","optimizer","reporter","custom"]).notNull(),
  status: mysqlEnum("status", ["active","idle","error","disabled"]).default("idle"),
  description: text("description"),
  config: json("config"),           // Agent-specific configuration
  lastRunAt: timestamp("lastRunAt"),
  lastResult: text("lastResult"),
  errorCount: int("errorCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const agentTasks = mysqlTable("agent_tasks", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  status: mysqlEnum("status", ["pending","running","completed","failed"]).default("pending"),
  input: json("input"),
  output: text("output"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

## Snippet — Agent Runner z LLM

```typescript
// server/agentRunner.ts
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

export async function runAgent(agentId: number, input: Record<string, unknown>) {
  const db = await getDb();
  const [agent] = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
  if (!agent || agent.status === "disabled") return;

  // Utwórz task
  const [task] = await db.insert(agentTasks).values({
    agentId, status: "running", input, startedAt: new Date()
  }).$returningId();

  // Aktualizuj status agenta
  await db.update(agents).set({ status: "active", lastRunAt: new Date() })
    .where(eq(agents.id, agentId));

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: buildSystemPrompt(agent) },
        { role: "user", content: JSON.stringify(input) },
      ],
    });

    const output = result.choices[0]?.message?.content ?? "";

    await db.update(agentTasks).set({
      status: "completed", output, completedAt: new Date()
    }).where(eq(agentTasks.id, task.insertId));

    await db.update(agents).set({
      status: "idle", lastResult: output.substring(0, 500)
    }).where(eq(agents.id, agentId));

    // Notyfikuj właściciela jeśli agent znalazł coś ważnego
    if (output.includes("CRITICAL") || output.includes("ACTION_REQUIRED")) {
      await notifyOwner({
        title: `Agent ${agent.name} requires attention`,
        content: output.substring(0, 1000),
      });
    }

    return { success: true, output };
  } catch (err) {
    await db.update(agentTasks).set({
      status: "failed", errorMessage: String(err), completedAt: new Date()
    }).where(eq(agentTasks.id, task.insertId));

    await db.update(agents).set({
      status: "error",
      errorCount: sql`${agents.errorCount} + 1`
    }).where(eq(agents.id, agentId));

    throw err;
  }
}

function buildSystemPrompt(agent: Agent): string {
  const basePrompts: Record<string, string> = {
    monitor: "You are a monitoring agent. Analyze the provided data and identify anomalies, errors, or issues that require attention.",
    analyzer: "You are a data analysis agent. Provide detailed insights and patterns from the provided data.",
    optimizer: "You are an optimization agent. Suggest specific improvements based on the provided data.",
    reporter: "You are a reporting agent. Generate a concise, structured report from the provided data.",
  };
  return basePrompts[agent.type] ?? "You are a helpful AI agent.";
}
```

## tRPC Router — Agents

```typescript
agents: router({
  list: protectedProcedure.query(() => listAgents()),

  run: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      input: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(({ input }) => runAgent(input.agentId, input.input ?? {})),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["active","idle","error","disabled"]),
    }))
    .mutation(({ input }) =>
      db.update(agents).set({ status: input.status }).where(eq(agents.id, input.id))
    ),

  tasks: protectedProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().default(20) }))
    .query(({ input }) =>
      db.select().from(agentTasks)
        .where(eq(agentTasks.agentId, input.agentId))
        .orderBy(desc(agentTasks.createdAt))
        .limit(input.limit)
    ),
}),
```

## Typy Agentów (z ai-control-center)

| Typ | Rola |
|---|---|
| `monitor` | Monitoruje uptime, błędy, anomalie |
| `analyzer` | Analizuje dane, wykrywa wzorce |
| `optimizer` | Sugeruje optymalizacje |
| `reporter` | Generuje raporty i podsumowania |
| `custom` | Dowolna logika zdefiniowana przez użytkownika |

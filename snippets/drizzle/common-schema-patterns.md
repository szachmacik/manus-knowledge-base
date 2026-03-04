# Snippet: Drizzle ORM — Najczęstsze Wzorce Schematów

**Stack:** Drizzle ORM + MySQL/TiDB
**Używane w:** integration-hub, ai-control-center, polaris-track

## Import Bazowy

```typescript
import {
  int, varchar, text, boolean, json, timestamp,
  mysqlEnum, mysqlTable
} from "drizzle-orm/mysql-core";
```

## Wzorzec: Tabela z Pełnym Audytem

```typescript
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  metadata: json("metadata"),              // Dowolne dane JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

## Wzorzec: Relacja Many-to-Many przez Junction Table

```typescript
export const projectIntegrations = mysqlTable("project_integrations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),          // FK → projects.id
  integrationSlug: varchar("integrationSlug", { length: 64 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  keySource: varchar("keySource", { length: 32 }).default("owner").notNull(),
  config: json("config"),                         // Integration-specific config
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

## Wzorzec: Enum Status

```typescript
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", [
    "pending", "running", "completed", "failed", "cancelled"
  ]).default("pending").notNull(),
  // ...
});
```

## Wzorzec: Soft Delete

```typescript
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  deletedAt: timestamp("deletedAt"),              // NULL = aktywny
  // ...
});

// Query: tylko aktywne
const active = await db.select().from(clients)
  .where(isNull(clients.deletedAt));
```

## Wzorzec: Audit Log (Universal)

```typescript
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 64 }).notNull(),  // "client", "project", "key"
  entityId: int("entityId"),
  action: varchar("action", { length: 64 }).notNull(),          // "created", "updated", "deleted"
  actorId: int("actorId"),                                       // FK → users.id
  actorName: varchar("actorName", { length: 255 }),
  details: json("details"),                                      // Przed/po zmianie
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Helper do logowania
export async function logAudit(
  db: DB,
  entityType: string,
  entityId: number | null,
  action: string,
  actorId: number | null,
  details?: Record<string, unknown>
) {
  await db.insert(auditLog).values({
    entityType, entityId, action, actorId, details: details ?? null
  });
}
```

## Wzorzec: Hierarchia (Parent-Child)

```typescript
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId"),                      // NULL = root
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  level: int("level").default(0).notNull(),        // 0 = root, 1 = child, ...
  sortOrder: int("sortOrder").default(0).notNull(),
});
```

## Wzorzec: Multi-tenant (Workspace Isolation)

```typescript
// Każda tabela ma workspaceId dla izolacji danych
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),       // ZAWSZE filtruj po tym
  amount: varchar("amount", { length: 32 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("PLN").notNull(),
  // ...
});

// Query: zawsze z workspaceId
const txs = await db.select().from(transactions)
  .where(eq(transactions.workspaceId, ctx.user.workspaceId));
```

## Wzorzec: Timestamps jako Unix MS

```typescript
// Alternatywa dla timestamp() — lepsze dla timezone handling
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  occurredAt: int("occurredAt").notNull(),         // Unix timestamp w ms
  // ...
});

// Użycie: Date.now() przy insert, new Date(occurredAt) przy display
```

## Typy TypeScript z Drizzle

```typescript
// Automatyczne typy z schematu
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export type UpdateClient = Partial<InsertClient>;

// Typ z relacją
export type ProjectWithClient = typeof projects.$inferSelect & {
  client: typeof clients.$inferSelect;
};
```

## Najczęstsze Query Patterns

```typescript
import { eq, and, or, like, gte, lte, isNull, isNotNull, desc, asc, sql } from "drizzle-orm";

// Znajdź po ID
const item = await db.select().from(items).where(eq(items.id, id)).limit(1);

// Upsert (insert or update)
await db.insert(items).values(data).onDuplicateKeyUpdate({ set: updateData });

// Paginacja
const page = await db.select().from(items)
  .orderBy(desc(items.createdAt))
  .limit(pageSize)
  .offset((page - 1) * pageSize);

// Count
const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(items);

// JSON field access (MySQL)
const result = await db.select().from(items)
  .where(sql`JSON_EXTRACT(metadata, '$.status') = 'active'`);
```

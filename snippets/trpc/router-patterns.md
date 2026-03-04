# Snippet: tRPC Router Patterns

**Stack:** tRPC 11 + Zod 4 + Express 4
**Używane w:** integration-hub, ai-control-center, polaris-track

## Bazowa Struktura Routera

```typescript
// server/routers/feature.ts
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { items } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const featureRouter = router({
  // Lista z paginacją
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(items)
        .orderBy(desc(items.createdAt))
        .limit(input.limit)
        .offset((input.page - 1) * input.limit);
    }),

  // Pobierz jeden
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [item] = await db.select().from(items).where(eq(items.id, input.id)).limit(1);
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      return item;
    }),

  // Utwórz
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [result] = await db.insert(items).values({
        ...input,
        createdBy: ctx.user.id,
      }).$returningId();
      return { id: result.insertId };
    }),

  // Aktualizuj
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...data } = input;
      await db.update(items).set(data).where(eq(items.id, id));
      return { success: true };
    }),

  // Usuń
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(items).where(eq(items.id, input.id));
      return { success: true };
    }),
});
```

## Admin Procedure (Role Guard)

```typescript
// server/_core/trpc.ts — dodaj adminProcedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
```

## Zod v4 — Ważne Różnice

```typescript
// Zod v4 — enum wymaga const array
const STATUS_VALUES = ["active", "inactive", "pending"] as const;
const statusSchema = z.enum(STATUS_VALUES);

// Zod v4 — record
const configSchema = z.record(z.string(), z.string()); // ✅
// z.record(z.string()) // ❌ — Zod v4 wymaga dwóch argumentów

// Zod v4 — optional
const optionalString = z.string().optional(); // ✅
```

## Middleware: Rate Limiting

```typescript
import { TRPCError } from "@trpc/server";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimitedProcedure = publicProcedure.use(({ ctx, next }) => {
  const key = ctx.req.ip ?? "unknown";
  const now = Date.now();
  const window = 60 * 1000; // 1 minuta
  const limit = 60;

  const current = requestCounts.get(key);
  if (!current || current.resetAt < now) {
    requestCounts.set(key, { count: 1, resetAt: now + window });
  } else {
    current.count++;
    if (current.count > limit) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }
  }
  return next();
});
```

## Middleware: Audit Log

```typescript
export const auditedProcedure = protectedProcedure.use(async ({ ctx, next, path }) => {
  const result = await next();
  // Loguj po wykonaniu
  const db = await getDb();
  if (db) {
    await db.insert(auditLog).values({
      entityType: path.split(".")[0] ?? "unknown",
      action: path,
      actorId: ctx.user.id,
      actorName: ctx.user.name ?? ctx.user.email ?? "unknown",
    });
  }
  return result;
});
```

## Rejestracja Routerów w appRouter

```typescript
// server/routers.ts
import { featureRouter } from "./routers/feature";
import { clientsRouter } from "./routers/clients";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  // Feature routers
  feature: featureRouter,
  clients: clientsRouter,
});
```

## Frontend — Optimistic Updates

```tsx
// Optimistic update dla listy
const utils = trpc.useUtils();
const deleteMutation = trpc.feature.delete.useMutation({
  onMutate: async ({ id }) => {
    await utils.feature.list.cancel();
    const prev = utils.feature.list.getData();
    utils.feature.list.setData(undefined, old =>
      old?.filter(item => item.id !== id) ?? []
    );
    return { prev };
  },
  onError: (_, __, ctx) => {
    utils.feature.list.setData(undefined, ctx?.prev);
  },
  onSettled: () => {
    utils.feature.list.invalidate();
  },
});
```

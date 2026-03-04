# Snippet: Rate Limiting dla Next.js API Routes

**Kiedy używać:** Każdy publiczny endpoint API (bez auth) powinien mieć rate limiting.

## Implementacja w lib/rate-limit.ts

```typescript
/**
 * Simple in-memory rate limiter for Next.js API routes
 * For production z wieloma instancjami: zastąp Redis (@upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup co 5 minut
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  limit: number;      // max requests
  windowSecs: number; // window in seconds
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 5, windowSecs: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSecs * 1000;
  const key = `rl:${identifier}`;
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    const entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { success: true, remaining: config.limit - 1, resetAt: entry.resetAt };
  }

  if (existing.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { success: true, remaining: config.limit - existing.count, resetAt: existing.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
```

## Użycie w route.ts

```typescript
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    // Rate limit: 10 req/min per IP
    const clientIp = getClientIp(request);
    const rl = checkRateLimit(`my-endpoint:${clientIp}`, { limit: 10, windowSecs: 60 });
    if (!rl.success) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, {
            status: 429,
            headers: {
                'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': '0',
            }
        });
    }
    // ... handler logic
}
```

## Zalecane limity

| Endpoint | Limit | Okno |
|----------|-------|------|
| Login | 5 req | 60s |
| NIP lookup / zewnętrzne API | 10 req | 60s |
| Telemetria / analytics | 30 req | 60s |
| Publiczne GET | 60 req | 60s |
| Admin endpoints | chronione przez `requireAdmin()` |

## Produkcja z wieloma instancjami

Zastąp `store` (Map) przez Redis z `@upstash/ratelimit`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

const { success } = await ratelimit.limit(clientIp);
```

**Źródło:** Projekt Zoney (educational-sales-site), 2026-03-04

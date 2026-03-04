# Wzorzec: Bezpieczna Weryfikacja Webhooków (HMAC)

**Źródło:** `polaris-track/server/webhookSecurity.ts`
**Zastosowanie:** Każdy endpoint przyjmujący webhooki od zewnętrznych serwisów (Stripe, Przelewy24, ManyChat, Meta itp.)

## Problem

Webhooki są podatne na:
- **Forged payloads** — ktoś wysyła fałszywe dane udając serwis
- **Replay attacks** — przechwycony webhook wysłany ponownie
- **Duplicate processing** — ten sam webhook przetworzony dwa razy

## Rozwiązanie

Każdy serwis ma swój algorytm podpisu. Implementuj je jako czyste funkcje weryfikujące.

## Snippet — Bazowy Wzorzec

```typescript
// server/webhookSecurity.ts
import crypto from "crypto";
import type { Request } from "express";

const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minut

// Constant-time comparison — zapobiega timing attacks
function safeCompare(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

// Weryfikacja timestamp — zapobiega replay attacks
function isTimestampFresh(timestampMs: number): boolean {
  return Math.abs(Date.now() - timestampMs) < REPLAY_WINDOW_MS;
}
```

## Snippet — Stripe

```typescript
export function verifyStripeSignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): { valid: boolean; reason?: string } {
  // Stripe używa: t=timestamp,v1=hash
  const parts = Object.fromEntries(
    signature.split(",").map(p => p.split("=") as [string, string])
  );
  const timestamp = parseInt(parts["t"] ?? "0", 10);
  if (!isTimestampFresh(timestamp * 1000)) {
    return { valid: false, reason: "Webhook timestamp too old (replay attack)" };
  }
  const payload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return safeCompare(parts["v1"] ?? "", expected)
    ? { valid: true }
    : { valid: false, reason: "Signature mismatch" };
}
```

## Snippet — Przelewy24

```typescript
export function verifyPrzelewy24Signature(
  body: Record<string, unknown>,
  crcKey: string
): { valid: boolean; reason?: string } {
  if (!crcKey) return { valid: false, reason: "Missing CRC key" };
  const payload = [body.sessionId, body.orderId, body.amount, body.currency, crcKey]
    .map(String).join("|");
  const expected = crypto.createHash("sha384").update(payload).digest("hex");
  return safeCompare(String(body.sign ?? ""), expected)
    ? { valid: true }
    : { valid: false, reason: "Signature mismatch" };
}
```

## Snippet — Generic HMAC SHA256

```typescript
export function verifyHmacSha256(
  payload: string | Buffer,
  receivedSig: string,
  secret: string,
  algorithm: "sha256" | "sha384" | "sha512" = "sha256"
): boolean {
  const expected = crypto.createHmac(algorithm, secret)
    .update(payload).digest("hex");
  return safeCompare(receivedSig.replace(/^sha256=/, ""), expected);
}
```

## Idempotency — Zapobieganie Duplikatom

```typescript
// W schemacie DB:
// webhookLogs: { gatewayTransactionId: varchar unique, ... }

async function processWebhookIdempotent(
  db: DB,
  transactionId: string,
  handler: () => Promise<void>
) {
  const existing = await db.select().from(webhookLogs)
    .where(eq(webhookLogs.gatewayTransactionId, transactionId)).limit(1);
  if (existing.length > 0) return; // Already processed
  await handler();
  await db.insert(webhookLogs).values({ gatewayTransactionId: transactionId, ... });
}
```

## Checklist Implementacji

```
[ ] Weryfikacja podpisu HMAC przed jakimkolwiek przetwarzaniem
[ ] Sprawdzenie świeżości timestamp (replay attack prevention)
[ ] Idempotency check (duplicate prevention)
[ ] Raw body parsing (nie JSON — podpis jest na surowych bajtach)
[ ] Constant-time comparison (timing attack prevention)
[ ] Logowanie nieudanych weryfikacji
```

## Uwaga: Raw Body

Stripe i inne serwisy podpisują **surowe bajty**, nie sparsowany JSON.
W Express musisz skonfigurować middleware przed `express.json()`:

```typescript
app.use("/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);
```

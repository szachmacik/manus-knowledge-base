# Pattern: Manus AI Panel w aplikacji webowej

## Źródło
Integration Hub — `/client/src/pages/ManusAI.tsx`, `/server/routers.ts` (manusAI router)

## Problem
Chcemy dać użytkownikowi możliwość rozmowy z AI które ma dostęp do danych aplikacji (klientów, projektów, integracji) i może autonomicznie wykonywać operacje.

## Rozwiązanie

### Backend (tRPC)
```ts
// server/routers.ts
const manusAIRouter = router({
  analyze: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // Zbierz dane kontekstowe
      const [stats, costs] = await Promise.all([
        getDashboardStats(),
        calcCosts(),
      ]);
      // Wywołaj LLM z kontekstem
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `Jesteś asystentem zarządzającym Integration Hub.
            Dane: ${JSON.stringify({ stats, costs })}` },
          { role: "user", content: input.prompt },
        ],
      });
      return {
        analysis: response.choices[0]?.message?.content ?? "",
        stats,
        costs,
      };
    }),
});
```

### Frontend
```tsx
// Streaming-like UX z Streamdown
import { Streamdown } from "streamdown";

const { mutate, isPending, data } = trpc.manusAI.analyze.useMutation();

<Streamdown>{data?.analysis ?? ""}</Streamdown>
```

## Kluczowe zasady
- Zawsze przekazuj kontekst danych do LLM w system prompt
- Używaj `Streamdown` do renderowania odpowiedzi markdown
- Przechowuj historię konwersacji w `useState` (nie w DB — sesja)
- Ogranicz dostęp do `protectedProcedure` (tylko zalogowani)

## Rozszerzenia
- Dodaj narzędzia (tools) do LLM żeby mógł wywoływać mutacje
- Zapisuj ważne decyzje AI do audit logu
- Dodaj predefiniowane prompty (quick actions)

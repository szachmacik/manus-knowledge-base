# Rejestr Manus Skills

Lista wszystkich aktywnych Skills w ekosystemie. Skills są przechowywane lokalnie w `/home/ubuntu/skills/`.

## Aktywne Skills

### integration-hub-standard ⭐ CYKLICZNA REGUŁA
**Lokalizacja:** `/home/ubuntu/skills/integration-hub-standard/`
**Trigger:** Każdy nowy projekt webowy, dodawanie integracji, konfiguracja kluczy API
**Opis:** Cykliczna reguła — każdy nowy projekt MUSI być zarejestrowany w Integration Hub i wyposażony w `hubConfig.ts`. Zawiera checklist, workflow dla klientów, hierarchię kluczy i plany cenowe.
**Zasoby:**
- `templates/hubConfig.ts` — gotowy helper do kopiowania do projektów
- `references/api.md` — pełna dokumentacja API Integration Hub

---

### excel-generator
**Lokalizacja:** `/home/ubuntu/skills/excel-generator/`
**Trigger:** Tworzenie arkuszy Excel, analiza danych w tabelach
**Opis:** Profesjonalne tworzenie arkuszy Excel z formatowaniem, wykresami i analizą danych.

---

### video-generator
**Lokalizacja:** `/home/ubuntu/skills/video-generator/`
**Trigger:** Tworzenie filmów, reklam wideo, content wideo
**Opis:** Workflow produkcji wideo z AI — od scenariusza do gotowego pliku.

---

### similarweb-analytics
**Lokalizacja:** `/home/ubuntu/skills/similarweb-analytics/`
**Trigger:** Analiza ruchu na stronach, badanie konkurencji
**Opis:** Analiza stron internetowych przez SimilarWeb — ruch, rankingi, źródła.

---

### github-gem-seeker
**Lokalizacja:** `/home/ubuntu/skills/github-gem-seeker/`
**Trigger:** Szukanie gotowych rozwiązań open-source zamiast pisania od zera
**Opis:** Wyszukiwanie sprawdzonych bibliotek GitHub dla typowych problemów.

---

### skill-creator
**Lokalizacja:** `/home/ubuntu/skills/skill-creator/`
**Trigger:** Tworzenie lub aktualizacja Skills
**Opis:** Przewodnik tworzenia Skills — init, edycja, walidacja, dostarczenie.

---

### internet-skill-finder
**Lokalizacja:** `/home/ubuntu/skills/internet-skill-finder/`
**Trigger:** Szukanie Skills dla konkretnych zadań
**Opis:** Wyszukiwanie Skills z GitHub dla specyficznych workflow.

---

## Zasada Dodawania Nowych Skills

Przy tworzeniu nowego Skill:
1. Uruchom `python /home/ubuntu/skills/skill-creator/scripts/init_skill.py <nazwa>`
2. Wypełnij `SKILL.md` zgodnie z wzorcem
3. Dodaj wpis do tego rejestru
4. Jeśli skill jest związany z projektem — dodaj link w `projects/registry.md`

## Skills do Stworzenia (Backlog)

| Skill | Opis | Priorytet |
|---|---|---|
| `oauth-platform-flows` | OAuth dla Meta, Google, TikTok, Allegro | Wysoki |
| `drizzle-schema-patterns` | Gotowe schematy DB dla typowych projektów | Wysoki |
| `trpc-router-patterns` | Wzorce routerów tRPC z auth, pagination | Średni |
| `manus-deploy-checklist` | Checklist przed każdym deployem | Średni |
| `client-onboarding` | Workflow dodawania nowego klienta | Niski |

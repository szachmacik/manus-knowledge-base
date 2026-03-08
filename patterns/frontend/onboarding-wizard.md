# Pattern: Onboarding Wizard wielokrokowy

## Źródło
Integration Hub — `/client/src/pages/Onboarding.tsx`

## Problem
Nowy użytkownik musi wykonać kilka kroków w określonej kolejności (np. klient → projekt → integracje). Chcemy prowadzić go krok po kroku bez przytłaczania formularzem.

## Rozwiązanie

```tsx
const STEPS = [
  { id: 1, title: "Klient",      icon: Users },
  { id: 2, title: "Projekt",     icon: FolderOpen },
  { id: 3, title: "Integracje",  icon: Plug },
];

const [step, setStep] = useState(1);
const [data, setData] = useState<WizardData>({});

// Progress bar
<div className="flex gap-2">
  {STEPS.map(s => (
    <div key={s.id}
      className={`h-1 flex-1 rounded-full transition-all ${
        s.id <= step ? "bg-primary" : "bg-muted"
      }`}
    />
  ))}
</div>

// Conditional rendering per step
{step === 1 && <StepClient onNext={(d) => { setData({...data, ...d}); setStep(2); }} />}
{step === 2 && <StepProject onNext={(d) => { setData({...data, ...d}); setStep(3); }} />}
{step === 3 && <StepIntegrations data={data} onFinish={handleFinish} />}
```

## Kluczowe zasady
- Każdy krok to osobny komponent z `onNext` callback
- Dane akumulują się w `useState` na poziomie Wizarda
- Wyślij wszystko do backendu dopiero na ostatnim kroku
- Pokaż podsumowanie przed finalnym submit
- Szablony branżowe (e-commerce, SaaS) = predefiniowane zestawy integracji

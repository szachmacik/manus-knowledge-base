# Pattern: Dashboard z Recharts (PieChart + StatCards)

**Źródło:** integration-hub v1.1 (Dashboard.tsx)  
**Technologie:** React, Recharts, shadcn/ui Card, tRPC

## StatCard — karta statystyki

```tsx
function StatCard({
  icon: Icon, label, value, sub, color = "text-primary", loading, href,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color?: string; loading?: boolean; href?: string;
}) {
  const inner = (
    <Card className={`${href ? "hover:border-primary/40 cursor-pointer" : ""} transition-colors`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            {loading ? <Skeleton className="h-8 w-20" /> : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-muted/50 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// Użycie
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard icon={Users} label="Klienci" value={stats?.clients ?? 0} href="/clients" color="text-blue-400" loading={statsLoading} />
  <StatCard icon={FolderOpen} label="Projekty" value={stats?.projects ?? 0} href="/projects" color="text-violet-400" loading={statsLoading} />
</div>
```

## PieChart z Recharts

```tsx
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS: Record<string, string> = {
  ai: "#6366f1", database: "#0ea5e9", payments: "#10b981",
  marketing: "#f59e0b", analytics: "#8b5cf6",
};

// Przygotowanie danych z API
const chartData = items
  ? Object.entries(
      items.reduce((acc: Record<string, number>, item: { category: string }) => {
        acc[item.category] = (acc[item.category] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }))
  : [];

// Render
<ResponsiveContainer width="100%" height={210}>
  <PieChart>
    <Pie
      data={chartData}
      cx="50%" cy="50%"
      innerRadius={52} outerRadius={82}
      paddingAngle={2}
      dataKey="value"
    >
      {chartData.map((entry) => (
        <Cell key={entry.name} fill={COLORS[entry.name] ?? "#6b7280"} />
      ))}
    </Pie>
    <Tooltip
      contentStyle={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "8px",
        fontSize: "12px",
      }}
    />
    <Legend
      formatter={(v) => <span className="text-xs text-muted-foreground capitalize">{v}</span>}
      iconSize={8}
    />
  </PieChart>
</ResponsiveContainer>
```

## Kluczowe zasady

- `ResponsiveContainer` zawsze z `width="100%"` i stałą `height`
- Tooltip z `contentStyle` dopasowanym do dark theme (CSS variables)
- Donut chart (`innerRadius` > 0) dla lepszej czytelności niż pełne kółko
- Kolory per kategoria jako stały `Record<string, string>` — łatwe do rozszerzenia
- Skeleton loader gdy dane jeszcze nie załadowane

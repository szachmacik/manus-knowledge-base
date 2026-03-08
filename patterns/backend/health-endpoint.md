# Pattern: Health Check Endpoint

**Źródło:** integration-hub v1.3
**Zastosowanie:** Każda aplikacja produkcyjna powinna mieć health endpoint

## Implementacja (Express + tRPC)

```ts
// server/_core/index.ts
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.get("/api/version", (_req, res) => {
  res.json({ version: process.env.npm_package_version || "1.0.0" });
});
```

## Docker HEALTHCHECK

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1
```

## GitHub Actions check

```yaml
- name: Health check
  run: |
    sleep 10
    curl -f https://your-domain.com/api/health
```

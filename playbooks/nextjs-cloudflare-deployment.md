# Playbook: Deployment Next.js na Cloudflare

**Ostatnia aktualizacja:** 2026-03-04  
**Autor:** Manus AI  
**Dotyczy:** Next.js 14/15 + Cloudflare Pages / Workers

---

## Decyzja: Cloudflare Pages vs Workers vs VPS

| Kryterium | Pages (Static) | Pages + next-on-pages | VPS + nginx |
|-----------|---------------|----------------------|-------------|
| Middleware (i18n, auth) | ❌ Nie działa | ⚠️ Wymaga `edge` runtime | ✅ Pełne wsparcie |
| Node.js APIs (fs, path) | ❌ | ❌ | ✅ |
| API Routes z DB | ❌ | ⚠️ Tylko edge-compatible | ✅ |
| Koszt | Darmowy | Darmowy | ~5-20$/mies |
| Automatyczny deploy | ✅ GitHub integration | ✅ | ⚠️ Wymaga CI/CD |
| Custom domain | ✅ | ✅ | ✅ |

**Reguła:** Jeśli projekt używa `middleware.ts` z cookies/headers LUB `fs/promises` w API routes → użyj VPS lub Cloudflare Workers z `nodejs_compat`.

---

## Opcja A: Cloudflare Pages (Static Export)

Działa tylko gdy projekt **nie ma middleware** i **nie używa Node.js APIs**.

```bash
# 1. Dodaj do next.config.mjs
output: 'export',
trailingSlash: true,

# 2. Build
npm run build

# 3. Deploy przez wrangler
wrangler pages deploy out --project-name=my-project
```

### Cloudflare Pages `_redirects` zamiast middleware i18n:
```
# public/_redirects
/  /pl  302
```

---

## Opcja B: next-on-pages (Edge Runtime)

Wymaga dodania `export const runtime = 'edge'` do **wszystkich** page.tsx i route.ts.

```bash
# Instalacja
npm install --save-dev @cloudflare/next-on-pages

# Build
npx @cloudflare/next-on-pages

# Deploy
wrangler pages deploy .vercel/output/static --project-name=my-project
```

**Uwaga:** Pliki używające `fs/promises`, `path`, `crypto` (Node.js built-ins) muszą być przepisane lub wykluczone z edge runtime.

**Skrypt automatycznego dodawania edge runtime:**
```python
# Dodaj do plików które NIE używają generateStaticParams i NIE importują fs/path
import os
from pathlib import Path

SKIP_PATTERNS = ['generateStaticParams', 'fs/promises', "from 'path'", "from 'fs'"]

for f in Path('app').rglob('*.tsx'):
    content = f.read_text()
    if any(p in content for p in SKIP_PATTERNS):
        continue
    if "export const runtime" not in content:
        f.write_text("export const runtime = 'edge';\n" + content)
```

---

## Opcja C: GitHub Actions + Wrangler (Rekomendowana dla CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy .next --project-name=my-project --commit-dirty=true
```

**Wymagane GitHub Secrets:**
```bash
gh secret set CLOUDFLARE_API_TOKEN --body "TOKEN" --repo owner/repo
gh secret set CLOUDFLARE_ACCOUNT_ID --body "ACCOUNT_ID" --repo owner/repo
```

**Uwaga:** GitHub App Manus nie ma scope `workflows` — nie może tworzyć plików `.github/workflows/` przez CLI. Musi to zrobić użytkownik ręcznie lub przez GitHub web UI.

---

## Opcja D: VPS + nginx + PM2 (Pełny SSR)

Najlepsza dla projektów z middleware, auth, i18n.

```bash
# Na serwerze
npm install -g pm2
npm run build
pm2 start npm --name "zoney" -- start -- -p 3000
pm2 save
pm2 startup
```

```nginx
# /etc/nginx/sites-available/kamilaenglish.ofshore.dev
server {
    listen 80;
    server_name kamilaenglish.ofshore.dev;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# SSL przez Certbot
certbot --nginx -d kamilaenglish.ofshore.dev
```

---

## Cloudflare API Token — wymagane uprawnienia

Dla deploymentu przez API potrzebny token z:

| Uprawnienie | Poziom | Akcja |
|-------------|--------|-------|
| Cloudflare Pages | Account | **Edit** |
| Account Settings | Account | **Read** |

```bash
# Weryfikacja tokenu
curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $TOKEN"

# Lista projektów Pages
curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $TOKEN"
```

**Ważne:** Wrangler CLI może nie działać przez proxy Manus (blokada sieci). Używaj curl/requests do Cloudflare API bezpośrednio.

---

## Bezpieczne przekazywanie tokenów do Manus

Zamiast wklejać token w czacie, uruchom lokalny serwer formularza:

```python
# Flask form server
from flask import Flask, request, redirect
app = Flask(__name__)

@app.route('/')
def form():
    return '''<form method="POST">
        <input type="password" name="token" placeholder="Wklej token">
        <button type="submit">Zatwierdź</button>
    </form>'''

@app.route('/', methods=['POST'])
def save():
    token = request.form.get('token', '').strip()
    if token:
        open('/tmp/cf_token.txt', 'w').write(token)
    return redirect('/')

app.run(port=4444)
```

Token jest zapisywany do `/tmp/cf_token.txt` i odczytywany przez skrypty deploymentu.

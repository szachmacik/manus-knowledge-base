# Snippet: Bezpieczny formularz do przekazywania tokenów do Manus

## Problem

Wklejanie tokenów API (Cloudflare, AWS, etc.) bezpośrednio w czacie Manus jest niebezpieczne — token pojawia się w historii rozmowy. Potrzebny jest bezpieczny kanał.

## Rozwiązanie — lokalny serwer Flask

Manus uruchamia lokalny serwer HTTP w sandboxie, wystawia go publicznie przez `expose`, a użytkownik wkleja token przez formularz HTTPS. Token trafia bezpośrednio do pliku w sandboxie, nie przez czat.

```python
#!/usr/bin/env python3
"""
Bezpieczny formularz do wklejania tokenów API.
Uruchom: python3 token_form.py
Dostęp: https://<manus-expose-url>
"""
from flask import Flask, request, redirect, render_template_string
import os

app = Flask(__name__)

TOKEN_FILE = '/tmp/cf_token.txt'  # Zmień ścieżkę wg potrzeby

FORM_HTML = '''<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bezpieczny formularz tokenu</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 500px; margin: 80px auto; padding: 20px; }
        h2 { color: #1a1a2e; }
        .info { background: #f0f4ff; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; }
        input[type="password"] { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box; margin: 8px 0; }
        button { background: #4f46e5; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; width: 100%; margin-top: 8px; }
        button:hover { background: #4338ca; }
        .success { color: #16a34a; font-weight: bold; }
    </style>
</head>
<body>
    <h2>🔐 Bezpieczny formularz tokenu</h2>
    <div class="info">
        Token zostanie zapisany bezpośrednio w sandboxie Manus.<br>
        <strong>Nie przechodzi przez czat.</strong>
    </div>
    {% if saved %}
    <p class="success">✅ Token zapisany pomyślnie! Możesz zamknąć tę kartę.</p>
    {% else %}
    <form method="POST">
        <label for="token"><strong>Wklej token API:</strong></label>
        <input type="password" id="token" name="token" placeholder="Token..." autocomplete="off" autofocus>
        <button type="submit">Zatwierdź bezpiecznie</button>
    </form>
    {% endif %}
</body>
</html>'''

@app.route('/', methods=['GET'])
def form():
    return render_template_string(FORM_HTML, saved=False)

@app.route('/', methods=['POST'])
def save_token():
    token = request.form.get('token', '').strip()
    if token:
        with open(TOKEN_FILE, 'w') as f:
            f.write(token)
        os.chmod(TOKEN_FILE, 0o600)  # Tylko właściciel może czytać
    return render_template_string(FORM_HTML, saved=bool(token))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4444, debug=False)
```

## Jak używać w projekcie Manus

```python
# 1. Uruchom serwer w tle
import subprocess
proc = subprocess.Popen(['python3', 'token_form.py'])

# 2. Wyeksponuj port (przez narzędzie expose Manus)
# URL: https://4444-xxx.manus.computer

# 3. Czekaj na token
import time, os
for _ in range(120):  # Czekaj max 2 minuty
    if os.path.exists('/tmp/cf_token.txt'):
        token = open('/tmp/cf_token.txt').read().strip()
        if token:
            print("Token odebrany!")
            break
    time.sleep(1)

# 4. Użyj tokenu
proc.terminate()
```

## Bezpieczeństwo

- Token jest zapisywany z uprawnieniami `600` (tylko właściciel)
- Serwer działa tylko w sandboxie Manus (izolowane środowisko)
- URL jest tymczasowy i wygasa po zakończeniu sesji
- Token nie pojawia się w historii czatu ani logach

## Warianty

```python
# Dla wielu tokenów naraz
TOKENS = {
    'cloudflare': '/tmp/cf_token.txt',
    'supabase': '/tmp/supabase_token.txt',
    'github': '/tmp/gh_token.txt',
}

# Formularz z wyborem serwisu
@app.route('/<service>', methods=['POST'])
def save_service_token(service):
    if service in TOKENS:
        token = request.form.get('token', '').strip()
        open(TOKENS[service], 'w').write(token)
    return redirect(f'/{service}?saved=1')
```

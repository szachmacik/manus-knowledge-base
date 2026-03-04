# Katalog Integracji

Pełna lista dostępnych integracji w Integration Hub. Bez kluczy API — tylko dokumentacja.

## AI & Machine Learning

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `openai` | OpenAI | GPT-4, DALL-E, Whisper, Embeddings | `OPENAI_API_KEY` |
| `anthropic` | Anthropic | Claude 3 Opus/Sonnet/Haiku | `ANTHROPIC_API_KEY` |
| `gemini` | Google Gemini | Gemini Pro, Gemini Vision | `GEMINI_API_KEY` |
| `elevenlabs` | ElevenLabs | Text-to-Speech, Voice Cloning | `ELEVENLABS_API_KEY` |
| `replicate` | Replicate | Open-source AI models | `REPLICATE_API_TOKEN` |
| `huggingface` | HuggingFace | Open-source models, Inference API | `HUGGINGFACE_API_KEY` |

## Database & Storage

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `supabase` | Supabase | PostgreSQL, Auth, Storage, Realtime | `SUPABASE_URL`, `SUPABASE_KEY` |
| `planetscale` | PlanetScale | MySQL serverless | `DATABASE_URL` |
| `upstash` | Upstash | Redis serverless, Kafka | `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN` |
| `cloudflare-r2` | Cloudflare R2 | S3-compatible object storage | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY` |

## Payments & Finance

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `stripe` | Stripe | Payments, Subscriptions, Connect | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `przelewy24` | Przelewy24 | Polish payment gateway | `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC_KEY` |
| `paypal` | PayPal | Global payments | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |

## Marketing & Communication

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `manychat` | ManyChat | Messenger/Instagram automation | `MANYCHAT_API_KEY` |
| `sendgrid` | SendGrid | Transactional email | `SENDGRID_API_KEY` |
| `mailchimp` | Mailchimp | Email marketing | `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX` |
| `twilio` | Twilio | SMS, Voice, WhatsApp | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |
| `postmark` | Postmark | Transactional email (high deliverability) | `POSTMARK_API_TOKEN` |
| `resend` | Resend | Developer-friendly email API | `RESEND_API_KEY` |

## Analytics & Monitoring

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `posthog` | PostHog | Product analytics, Feature flags | `POSTHOG_API_KEY`, `POSTHOG_HOST` |
| `google-analytics` | Google Analytics | Web analytics (GA4) | `GA_MEASUREMENT_ID` |
| `sentry` | Sentry | Error tracking, Performance | `SENTRY_DSN` |
| `datadog` | Datadog | Infrastructure monitoring | `DATADOG_API_KEY` |

## Advertising Platforms

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `meta-ads` | Meta Ads | Facebook/Instagram advertising | `META_APP_ID`, `META_APP_SECRET` |
| `google-ads` | Google Ads | Search/Display advertising | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `tiktok-ads` | TikTok Ads | TikTok advertising | `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET` |

## E-commerce

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `allegro` | Allegro | Polish marketplace | `ALLEGRO_CLIENT_ID`, `ALLEGRO_CLIENT_SECRET` |
| `baselinker` | BaseLinker | Multi-channel order management | `BASELINKER_API_TOKEN` |
| `shopify` | Shopify | E-commerce platform | `SHOPIFY_STORE_URL`, `SHOPIFY_ACCESS_TOKEN` |

## DevOps & Infrastructure

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `github` | GitHub | Code hosting, Actions, Issues | `GITHUB_TOKEN` |
| `vercel` | Vercel | Frontend deployment | `VERCEL_TOKEN` |
| `cloudflare` | Cloudflare | DNS, CDN, Workers | `CLOUDFLARE_API_TOKEN` |
| `digitalocean` | DigitalOcean | Cloud infrastructure | `DO_API_TOKEN` |

## Automation & Integration

| Slug | Serwis | Opis | Wymagane zmienne |
|---|---|---|---|
| `zapier` | Zapier | No-code automation | `ZAPIER_WEBHOOK_URL` |
| `make` | Make (Integromat) | Advanced automation | `MAKE_API_KEY` |
| `n8n` | n8n | Self-hosted automation | `N8N_WEBHOOK_URL` |
| `airtable` | Airtable | Database + spreadsheet | `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` |

## Dodawanie Nowej Integracji

Aby dodać nową integrację do katalogu:
1. Dodaj wpis do tej tabeli
2. Dodaj seed w `integration-hub/server/seed.ts`
3. Uruchom seed: `npx tsx server/seed.ts`
4. Zaktualizuj `integration-hub` na GitHub

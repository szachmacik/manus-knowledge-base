# SEO Structured Data (JSON-LD) dla Next.js

## Komponent JsonLd (components/seo/json-ld.tsx)

```tsx
'use client'

interface OrganizationSchemaProps {
  lang: string
}

export function OrganizationSchema({ lang }: OrganizationSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kamila.ofshore.dev'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kamila English',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://www.facebook.com/kamilaenglish',
      'https://www.instagram.com/kamilaenglish',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Polish', 'English'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteSchema({ lang }: { lang: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kamila.ofshore.dev'
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    name: 'Kamila English',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/${lang}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

## Dodanie do layout.tsx

```tsx
import { OrganizationSchema, WebSiteSchema } from '@/components/seo/json-ld'

// W <head>:
<OrganizationSchema lang={lang} />
<WebSiteSchema lang={lang} />
```

## Dynamiczny sitemap (app/sitemap.ts)

```typescript
import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/product-service'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kamila.ofshore.dev'
const LANGUAGES = ['pl', 'en', 'de', 'fr', /* ... */]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  
  const staticPages = ['', '/products', '/blog', '/contact', '/about']
  
  const entries: MetadataRoute.Sitemap = []
  
  // Static pages × languages
  for (const lang of LANGUAGES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      })
    }
  }
  
  // Product pages × languages
  for (const product of products) {
    for (const lang of LANGUAGES) {
      entries.push({
        url: `${BASE_URL}/${lang}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }
  
  return entries
}
```

## robots.txt

```
User-agent: *
Allow: /

# Block private routes
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /checkout/

Sitemap: https://yourdomain.com/sitemap.xml
```

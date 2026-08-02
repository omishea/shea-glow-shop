## Problem

The product page fetches its product with `useQuery` in the component, so at server-render time the HTML contains no product data — and today it emits no `og:image` at all. Meta's crawler doesn't run JavaScript, so it falls back to a gray placeholder. The homepage likewise has no `og:image`, no `og:url`, and no `og:site_name`.

## Fix

**1. Product route (`src/routes/product.$handle.tsx`)**
- Add a `loader` that calls `fetchProductByHandle(params.handle)` so the product is fetched during SSR and available to `head()` as `loaderData`. Keep the component reading from the same route data (via `Route.useLoaderData()`), so no client refetch is needed and nothing renders "loading" for crawlers.
- Build `head()` from real product data: title, description (cleaned Shopify description, truncated ~155 chars), and the product's first image as `og:image` / `twitter:image`.
- Normalize the Shopify CDN image URL with `?width=1200&height=630&crop=center` so every preview is exactly 1200×630 (Shopify CDN is public, https, HTTP 200, no auth). Emit `og:image:width` 1200, `og:image:height` 630, plus `og:image:alt` and `og:image:secure_url`.
- Add self-referencing `og:url` and `<link rel="canonical">` pointing at `https://shea-glow-shop.lovable.app/product/{handle}`.
- Add `og:type: product` (already present) and Product JSON-LD (name, image, description, offers with price/currency/availability from the first variant).

**2. Homepage (`src/routes/index.tsx`)**
- Add `og:url` + canonical for the site root, `og:image` using the hero image resolved to an absolute URL on the site domain, with width/height/alt tags and `twitter:image`.
- Add `twitter:title` and `twitter:description` (currently only `twitter:card` exists).

**3. Root (`src/routes/__root.tsx`)**
- Add `og:site_name: "Shea Org"`, `og:locale: "sv_SE"`, and keep `og:type: website` as the sitewide default. No `og:image` and no canonical at root — a root-level image would override every product page's preview.

**4. Hero image sizing**
The current hero asset is 1600×1104. For a clean 1.91:1 homepage preview I'll add a dedicated 1200×630 social preview image (cropped/generated from the same hero art) and reference that from the homepage `og:image` only — the on-page hero stays as is.

**5. SEO extras**
- Add `public/sitemap.xml` listing `/` and the product URL, and a `Sitemap:` line in `robots.txt`.
- Confirm `robots.txt` already allows `facebookexternalhit` and `Twitterbot` (it does) and add `Facebot`.

## Verification

- Run the production-ish render and `curl` the product URL, grepping the raw HTML for `og:image` to prove it's in the initial server HTML with no JS.
- Fetch the resulting image URL and confirm HTTP 200 + `image/*` content type.
- Type-check.

## Note

Facebook and LinkedIn cache the last preview they scraped. After this ships, existing shared links keep the old gray preview until re-scraped — you can force it in Facebook's Sharing Debugger ("Scrape Again").

## Technical details

- TanStack Start route `head({ loaderData })` runs on the server, so loader-derived tags land in the initial HTML.
- `fetchProductByHandle` uses the public Storefront token and works fine during SSR; a missing product falls back to generic metadata rather than throwing.
- Canonical goes on leaf routes only (root + leaf would emit two canonical links).

---
'@laioutr/app-actindo': minor
---

Add the Actindo Storefront Data Service catalog connector — Orchestr handlers mapping the service to the Laioutr canonical entities:

- Product (`by-slug` / `search` / `by-category-{slug,id}`), variants + breadcrumb links, and full `Product` / `ProductVariant` component resolvers
- Category (`by-slug` / `all`), products + breadcrumb (ancestor-trail) links, resolver
- SuggestedSearch (header autocomplete) and Navigation/Menu (`MenuByAlias`)
- PDP / PLP / search page types + query templates (category, menu)
- NuxtImage `actindo` provider and a configurable locale map (`de → de-DE`)

Aligns `@laioutr-core/*` and `@laioutr-app/ui` to the 2.x line (canonical `0.22.25`, core/frontend/orchestr/kit `0.30.x`, ui `2.2.3`).

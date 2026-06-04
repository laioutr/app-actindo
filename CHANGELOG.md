# @laioutr/app-actindo

## 0.1.0

### Minor Changes

- 36e30fd: Add the Actindo Storefront Data Service catalog connector — Orchestr handlers mapping the service to the Laioutr canonical entities:
  - Product (`by-slug` / `search` / `by-category-{slug,id}`), variants + breadcrumb links, and full `Product` / `ProductVariant` component resolvers
  - Category (`by-slug` / `all`), products + breadcrumb (ancestor-trail) links, resolver
  - SuggestedSearch (header autocomplete) and Navigation/Menu (`MenuByAlias`)
  - PDP / PLP / search page types + query templates (category, menu)
  - NuxtImage `actindo` provider and a configurable locale map (`de → de-DE`)

  Aligns `@laioutr-core/*` and `@laioutr-app/ui` to the 2.x line (canonical `0.22.25`, core/frontend/orchestr/kit `0.30.x`, ui `2.2.3`).

## 0.0.1

### Patch Changes

- 28fc102: Declare `@laioutr-core/kit` and `defu` as dependencies. They are imported by the module at runtime but were previously only resolved through hoisting, which broke installs in strict node_modules layouts.

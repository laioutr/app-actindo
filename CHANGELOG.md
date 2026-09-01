# @laioutr/app-actindo

## 0.2.0

### Minor Changes

- 9e336af: Resolve `ProductOptionGroups` and complete `ProductDefaultVariant`

  The product tile in `@laioutr-app/ui` 2.22.1 stopped loading a product's variants
  and now reads its swatch/size row from `ProductOptionGroups`, with the
  add-to-cart state and analytics sku coming from `ProductDefaultVariant`. This
  connector provided neither — `optionGroups` not at all, and `defaultVariant` with
  only `id` and `options` — so the tile could not resolve.

  Actindo exposes no product-level option matrix and sends only an `id` on
  `defaultVariant`, so both are folded out of the product's variants: the axes and
  their values with a representative `variantId` and a per-value `available` flag,
  and the named variant's `sku` and `status`. `origin` is reported as `derived` —
  Actindo names a variant but declares no merchant intent, and a tile that pins
  `?variant=` on a derived choice changes the product's URL whenever a size sells
  out.

  The variants are fetched once per resolve, batched across every product in the
  query (two calls for a 25-product listing, not two per product), and only for
  the products and components that actually need them. Both components are read
  from Actindo directly if the service ever starts sending them, in which case the
  extra round-trips stop happening on their own.

  Also bumps `@laioutr-app/ui` to 2.22.1 and fixes the playground's module order —
  `@laioutr-core/frontend-core` has to set up before this app so the `apiKey` from
  `laioutrrc.json` reaches the runtime config.

## 0.1.2

### Patch Changes

- 0d193e1: Fix and align the connector's configuration handling.
  - **Runtime-config key:** the client factory, orchestr middleware and the `RuntimeConfig` type augmentation now read the scoped `@laioutr/app-actindo` key (matching the module `configKey`) instead of the unscoped `app-actindo`. A platform host configuring under the module's config key previously received an empty `apiKey`. The namespace is centralized as `APP_CONFIG_KEY` in `server/const`.
  - **Credential delivery:** the connection (`apiKey`, optional `baseUrl`, `localeMap`) is now sourced solely from the Laioutr project config (`laioutrrc.json` → `apps[].config` → `runtimeConfig[configKey]`), matching every other standalone connector app. Dropped the bespoke `.env` / `ACTINDO_API_KEY` env-fallback path.

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

---
'@laioutr/app-actindo': minor
---

Resolve `ProductOptionGroups` and complete `ProductDefaultVariant`

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

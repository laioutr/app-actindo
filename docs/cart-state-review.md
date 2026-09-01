# State of the cart — Actindo connector

**Reviewed:** 2026-09-01 · against `@laioutr-core/canonical-types` 0.32.2, `@laioutr-app/ui` 2.22.1, and the Actindo Storefront Data Service OpenAPI document `0.1.0-mvp` (robert-ley staging).

## Verdict

The Actindo connector implements **no** cart functionality, and that is not a gap to close here. The Actindo Storefront Data Service says so itself, in the preamble of its own OpenAPI document:

> Read API consumed by a laioutr connector. Field shapes mirror laioutr canonical components.
> **Cart & checkout are delegated to laioutr Checkout and are not part of this API.**

So cart is assigned, by design, to a system called **laioutr Checkout** — which does not exist yet. There is no such package, module, or code reference anywhere in the laioutr monorepo. That absence, not the connector, is the thing blocking cart on this storefront.

**Recommendation: keep cart out of `app-actindo`.** Track laioutr Checkout as the owner and revisit when it ships. Building a cart against Actindo would mean inventing a write API the service has deliberately declined to offer.

## What the canonical contract asks for

The contract is complete and stable — nothing here is scaffolding. It lives in `@laioutr-core/canonical-types`.

| Kind | Token | Name on the wire |
| --- | --- | --- |
| Query | `GetCurrentCartQuery` | `ecommerce/cart/get-current` |
| Action | `CartAddItemsAction` | `ecommerce/cart/add-items` |
| Action | `CartUpdateItemsAction` | `ecommerce/cart/update-items` |
| Action | `CartRemoveItemsAction` | `ecommerce/cart/remove-items` |
| Action | `GetCheckoutUrlAction` | `ecommerce/cart/get-checkout-url` |
| Link | `CartItemsLink` | `ecommerce/cart/cart-items` |
| Link | `CartItemProductVariantLink` | `ecommerce/cart/cart-item-product-variant` |

Entity components: `CartBase` (`totalQuantity`, `customFields?`, `checkoutLink?`) and `CartCost` (`subtotal`, `total`, both with `isEstimated` flags, plus optional nested `shipping`/`duty`/`tax` and a `taxes[]` breakdown); `CartItemBase`, `CartItemCost`, `CartItemAvailability`, `CartItemProductData`, `CartItemQuantityRule`.

Five typed errors — `ProductNotFoundError`, `ProductStockError`, `ProductQuantityError`, `DiscountCodeNotFoundError`, `DiscountCodeNotRedeemableError` — plus the `CartBatchResultItem` vocabulary (`added` / `rejected`, with reasons `not-found`, `sold-out`, `quantity-adjusted`, `not-orderable`).

Three design rules are worth knowing before anyone implements this:

1. **One cart per session.** Every item added goes to the same cart.
2. **There is no create-cart action.** If the backend needs a cart to exist first, the connector creates it inside `add-items` (or in middleware).
3. **Per-item failures are returned, not thrown.** An unknown SKU or a sold-out line is a row in the output. Only whole-call failures (auth, malformed request) throw.

## What Actindo offers

Nothing on the write side. The OpenAPI document lists 15 endpoints, all reads:

```
GET  /health
GET  /v1/categories/            POST /v1/categories/batch
GET  /v1/categories/by-slug/{slug}[/products]
GET  /v1/categories/by-id/{id}/products
GET  /v1/navigation/{alias}
GET  /v1/products/by-slug/{slug}    POST /v1/products/batch
GET, POST /v1/products/search
GET  /v1/products/{id}/breadcrumb   GET  /v1/products/{id}/variants
POST /v1/products/variants/batch    POST /v1/variants/batch
POST /v1/availability/batch
```

Probed against staging, every plausible cart path 404s on both `GET` and `POST`: `/v1/cart`, `/v1/carts`, `/v1/basket`, `/v1/checkout`, `/v1/orders`.

On the connector side there is correspondingly nothing: no `orchestr/cart/` directory, no cart or line-item DTOs in `types/actindo.ts`, and no `*.action.ts` file anywhere. `defineActindo` does not even expose an action factory — it exports only `queryHandler`, `linkHandler`, `componentResolver` and `queryTemplateProvider`. Adding `export const defineActindoAction = defineActindo.actionHandler;` would be the one-line prerequisite for any mutation.

## The storefront is already half-wired

Worth flagging, because it looks like a bug until you know the cause. `laioutrrc.json` carries:

- a `BlockProductDetailCartButton` on the PDP,
- `showCart: true` on the header (twice),
- and **seven** `showAddToCart` props, every one of them explicitly `false`.

That is a storefront configured by someone who knew there was no backend: the cart chrome is present, the add-to-cart affordances are switched off.

## What the UI would need

`ConnectedCartSheet.vue` in `@laioutr-app/ui` is the entire cart application layer — a drawer. There is no cart page and no `ecommerce/cart-page` page type. There is also no `useCart` or cart store anywhere; state is the generic orchestr store plus local refs, with optimistic writes debounced through `createOptimisticQueue`.

It requires: `cost.subtotal` / `cost.total` (and optional `cost.shipping.total`) on the cart; `base.checkoutLink`; and per line `base` (`type`, `quantity`, `title`, `subtitle`, `brand`, `code`, `link`, `cover`), `cost`, `availability.status` and `quantityRule`.

Two details that shape any implementation:

- **`GetCheckoutUrlAction` is implemented by nobody.** Every connector puts the URL on `CartBase.checkoutLink` instead, and the drawer resolves only that. A backend that cannot put a checkout URL on the cart entity has no checkout path at all.
- **Discount codes are modelled as cart items**, with `base.type === 'discount-code'`. A connector that does not surface them simply gets no coupon UI.

## If it ever does land here

Shopify's `orchestr/cart/` is the only production-grade implementation in the platform (read, write, discount codes, stock/quantity error mapping, cart-cookie recovery). Adobe Commerce is partial and has drifted: its resolver still emits the old flat `CartCost` shape (`totalTax`, `taxesIncluded`, `totalDuty`, `dutiesIncluded`), none of which exist on the component any more, and resolver output is not schema-validated at runtime — so it fails silently rather than loudly. Do not copy from it.

The best written spec is `docs/plans/2026-07-16-shopware-cart-cart-items-plan.md` in the laioutr monorepo — a 14-task blueprint. Its two load-bearing constraints:

- one `/cart` fetch shared across query, resolver and link through a `cartFragmentToken` passthrough;
- **no caching on any cart handler** — carts are per-session and mutable.

All of that work would be confined to this connector package. The contract, the orchestr runtime and the UI are connector-agnostic, and handler registration is automatic via the existing `orchestrDirs` glob.

## Open question for Actindo

Who owns laioutr Checkout, and what is its timeline? Until that is answered, the cart on this storefront has no owner — and the seven `showAddToCart: false` flags in `laioutrrc.json` are the correct configuration.

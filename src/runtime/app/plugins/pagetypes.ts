import { defineNuxtPlugin } from '#app';
import { ProductDetailPage, ProductListingPage, ProductSearchPage } from '@laioutr-core/canonical-types/ecommerce';
import { pageTypeTokenRegistry } from '@laioutr-core/core-types/frontend';

/**
 * Registers the canonical commerce page types this connector powers, so Studio
 * offers them and their route → query bindings are active:
 *
 * - `ProductDetailPage` (`/products/:slug+`) → `ecommerce/product/by-slug`
 *   (the PDP "page query": `route.params.slug` → `ProductBySlugQuery`).
 * - `ProductListingPage` (`/categories/:slug+`) → category by-slug + products.
 * - `ProductSearchPage` (`/search`) → product search.
 *
 * Page-type tokens self-register at import time; touching each via
 * `getMetadata` keeps the bundler from tree-shaking the imports away (the
 * standard pattern — see Laioutr docs › Page Types).
 */
export default defineNuxtPlugin(() => {
  [ProductDetailPage, ProductListingPage, ProductSearchPage].forEach((token) => pageTypeTokenRegistry.getMetadata(token));
});

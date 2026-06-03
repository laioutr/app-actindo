import { createPassthroughToken } from '#imports';
import type { generateSuggestedSearchEntries } from '../orchestr-helper/generateSuggestedSearchEntries';
import type { ActindoProduct, FlattenedActindoNavItem } from '../types/actindo';

/**
 * Full products fetched by a query handler (e.g. the PDP `bySlug` query via the
 * service's `expand`), forwarded to the `Product` component resolver so it does
 * not re-fetch via `/v1/products/batch`. Empty on cross-app composition or
 * cache restore — the resolver always falls back to a direct batch call.
 */
export const productsFragmentToken = createPassthroughToken<ActindoProduct[]>('actindo/productsFragment');

/**
 * Pre-built `SuggestedSearchEntry` resolver-entities, forwarded from the
 * `suggested-search/search` query to its entries link + resolver. Typed via the
 * generator's return type to avoid importing the internal `ResolverEntity`.
 */
export const suggestedSearchEntriesToken = createPassthroughToken<ReturnType<typeof generateSuggestedSearchEntries>>(
  'actindo/suggestedSearchEntries',
);

/**
 * Flattened navigation nodes, forwarded from the `menu/by-alias` query to the
 * `MenuItem` resolver (which maps them to canonical menu items).
 */
export const menuItemsFragmentToken = createPassthroughToken<FlattenedActindoNavItem[]>('actindo/menuItems');

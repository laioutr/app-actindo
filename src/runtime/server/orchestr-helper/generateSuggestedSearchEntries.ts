import { $entity } from '#imports';
import { ProductSearchPage } from '@laioutr-core/canonical-types/ecommerce';
import { SuggestedSearchEntryBase } from '@laioutr-core/canonical-types/entity/suggested-search-entry';
import type { ActindoProduct } from '../types/actindo';
import { mapMediaImage } from '../actindo-helper/media';

/**
 * Build `SuggestedSearchEntry` resolver-entities for the autocomplete dropdown:
 *
 * 1. A `query-suggestion` entry for the typed term — a `pageType` link to the
 *    product search page carrying `?q=<term>`. This is what the header's submit
 *    ("search for …") navigates to, so results land on `/search?q=<term>`.
 * 2. One `product` entry per hit, linking to the PDP (reference link).
 *
 * Actindo has no predictive-search endpoint, so the product hits come from
 * `/v1/products/search` and the query-suggestion is the term itself.
 */
export const generateSuggestedSearchEntries = (term: string, products: ActindoProduct[]) => {
  const querySuggestion = $entity([SuggestedSearchEntryBase], {
    id: `suggested-search-entry:query:${term}`,
    base: {
      type: 'query-suggestion',
      title: term,
      link: { type: 'pageType', pageType: ProductSearchPage, query: { q: term } },
    },
  });

  const productEntries = products.map((product) => {
    const coverSource = product.info?.cover ?? product.media?.images?.[0];

    return $entity([SuggestedSearchEntryBase], {
      id: `suggested-search-entry:product:${product.id}`,
      base: {
        type: 'product',
        title: product.base.name,
        link: {
          type: 'reference',
          reference: { type: 'Product', slug: product.base.slug, id: product.id },
        },
        cover: coverSource ? mapMediaImage(coverSource) : undefined,
      },
    });
  });

  return [querySuggestion, ...productEntries];
};

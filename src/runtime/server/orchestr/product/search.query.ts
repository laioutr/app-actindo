import { ProductSearchQuery } from '@laioutr-core/canonical-types/ecommerce';
import { mapAvailableFilters } from '../../actindo-helper/availableFilterMapper';
import { mapAvailableSortings } from '../../actindo-helper/availableSortingMapper';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { searchProducts } from '../../queries/product';

/**
 * Full-text product search → a page of product ids. Facets and sortings are
 * surfaced as canonical `availableFilters` / `availableSortings` for the
 * listing UI. Product data is hydrated by the `Product` resolver.
 */
export default defineActindoQuery(ProductSearchQuery, async ({ input, pagination, sorting, filter, context }) => {
  const page = await searchProducts(context.client, {
    q: input.query,
    sort: sorting,
    limit: pagination.limit,
    offset: pagination.offset,
    filter,
    locale: context.locale,
    currency: context.currency,
  });

  return {
    ids: page.ids,
    total: page.total,
    sorting: page.sorting,
    availableSortings: mapAvailableSortings(page.sortings),
    availableFilters: mapAvailableFilters(page.facets),
  };
});

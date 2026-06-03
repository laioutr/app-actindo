import { CategoryNotFoundError, ProductsByCategorySlugQuery } from '@laioutr-core/canonical-types/ecommerce';
import { mapAvailableFilters } from '../../actindo-helper/availableFilterMapper';
import { mapAvailableSortings } from '../../actindo-helper/availableSortingMapper';
import { isActindoNotFound } from '../../actindo-helper/errors';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { getProductsByCategorySlug } from '../../queries/product';

/**
 * Category listing page addressed by category slug → a page of product ids.
 *
 * An unknown category slug surfaces as the canonical `CategoryNotFoundError`
 * (a typed 404 the frontend renders as a not-found page) rather than letting
 * the raw service 404 bubble up as an unhandled 500.
 */
export default defineActindoQuery(ProductsByCategorySlugQuery, async ({ input, pagination, sorting, filter, context }) => {
  let page;
  try {
    page = await getProductsByCategorySlug(context.client, input.categorySlug, {
      sort: sorting,
      limit: pagination.limit,
      offset: pagination.offset,
      filter,
      locale: context.locale,
      currency: context.currency,
    });
  } catch (error) {
    if (isActindoNotFound(error)) throw new CategoryNotFoundError(input.categorySlug);
    throw error;
  }

  return {
    ids: page.ids,
    total: page.total,
    sorting: page.sorting,
    availableSortings: mapAvailableSortings(page.sortings),
    availableFilters: mapAvailableFilters(page.facets),
  };
});

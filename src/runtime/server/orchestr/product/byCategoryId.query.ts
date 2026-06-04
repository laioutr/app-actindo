import { CategoryNotFoundError, ProductsByCategoryIdQuery } from '@laioutr-core/canonical-types/ecommerce';
import { mapAvailableFilters } from '../../actindo-helper/availableFilterMapper';
import { mapAvailableSortings } from '../../actindo-helper/availableSortingMapper';
import { isActindoNotFound } from '../../actindo-helper/errors';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { getProductsByCategoryId } from '../../queries/product';

/**
 * Category listing page addressed by opaque category id → a page of product ids.
 *
 * An unknown category id surfaces as the canonical `CategoryNotFoundError`
 * rather than an unhandled 500 from the raw service 404.
 */
export default defineActindoQuery(ProductsByCategoryIdQuery, async ({ input, pagination, sorting, filter, context }) => {
  let page;
  try {
    page = await getProductsByCategoryId(context.client, input.categoryId, {
      sort: sorting,
      limit: pagination.limit,
      offset: pagination.offset,
      filter,
      locale: context.locale,
      currency: context.currency,
    });
  } catch (error) {
    if (isActindoNotFound(error)) throw new CategoryNotFoundError(input.categoryId);
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

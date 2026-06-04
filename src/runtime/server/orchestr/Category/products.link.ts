import { CategoryProductsLink } from '@laioutr-core/canonical-types/ecommerce';
import { mapAvailableFilters } from '../../actindo-helper/availableFilterMapper';
import { mapAvailableSortings } from '../../actindo-helper/availableSortingMapper';
import { isActindoNotFound } from '../../actindo-helper/errors';
import { defineActindoLink } from '../../middleware/defineActindo';
import { getProductsByCategoryId } from '../../queries/product';

/**
 * Category → its product ids (the category listing). Each source category is
 * fetched independently (the service has no combined endpoint) and carries its
 * own total + available filters/sortings. Hydrated by the `Product` resolver.
 *
 * The source category was already resolved (via `CategoryBySlug`), so a `404`
 * on its products sub-resource means an empty/unavailable listing — that source
 * degrades to zero products rather than failing the whole request.
 */
export default defineActindoLink({
  implements: CategoryProductsLink,
  run: async ({ entityIds, pagination, sorting, filter, context }) => {
    const links = await Promise.all(
      entityIds.map(async (categoryId) => {
        try {
          const page = await getProductsByCategoryId(context.client, categoryId, {
            sort: sorting,
            limit: pagination.limit,
            offset: pagination.offset,
            filter,
            locale: context.locale,
            currency: context.currency,
          });
          return {
            sourceId: categoryId,
            targetIds: page.ids,
            entityTotal: page.total,
            availableSortings: mapAvailableSortings(page.sortings),
            availableFilters: mapAvailableFilters(page.facets),
          };
        } catch (error) {
          if (isActindoNotFound(error)) {
            return { sourceId: categoryId, targetIds: [], entityTotal: 0 };
          }
          throw error;
        }
      }),
    );

    return { links };
  },
});

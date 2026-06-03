import { CategoryAllQuery } from '@laioutr-core/canonical-types/ecommerce';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { getAllCategoryIds } from '../../queries/category';

/**
 * All category ids for the tenant (the flattened tree). The service returns the
 * full id list in one shot; pagination is applied here so `total` reflects the
 * whole tree while only a page of ids is hydrated.
 */
export default defineActindoQuery(CategoryAllQuery, async ({ pagination, context }) => {
  const { ids } = await getAllCategoryIds(context.client);

  return {
    ids: ids.slice(pagination.offset, pagination.offset + pagination.limit),
    total: ids.length,
  };
});

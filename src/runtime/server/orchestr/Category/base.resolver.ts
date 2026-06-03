import { CategoryBase, CategoryContent, CategoryMedia, CategorySeo } from '@laioutr-core/canonical-types/entity/category';
import { defineActindoComponentResolver } from '../../middleware/defineActindo';
import { generateCategoryComponents } from '../../orchestr-helper/generateCategoryComponents';
import { getCategoriesBatch } from '../../queries/category';

/**
 * Hydrates `Category` entities from `/v1/categories/batch`.
 */
export default defineActindoComponentResolver({
  label: 'Actindo Category Connector',
  entityType: 'Category',
  provides: [CategoryBase, CategoryContent, CategoryMedia, CategorySeo],
  cache: { ttl: '1 hour' },
  resolve: async ({ entityIds, requestedComponents, context }) => {
    const { items } = await getCategoriesBatch(context.client, entityIds, {
      locale: context.locale,
      components: requestedComponents,
    });

    return {
      entities: generateCategoryComponents(items),
    };
  },
});

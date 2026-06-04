import { ProductsByCategorySlugQuery } from '@laioutr-core/canonical-types/ecommerce';
import type { RemoteQueryTemplate } from '@laioutr-core/core-types/orchestr';
import { ACTINDO_BATCH_LIMIT } from '../../const';
import { defineActindoQueryTemplateProvider } from '../../middleware/defineActindo';
import { getAllCategoryIds, getCategoriesBatch } from '../../queries/category';

/** Max number of category options offered to the editor. */
const MAX_TEMPLATES = 25;

/**
 * Supplies the page editor with selectable category options for a
 * "products by category slug" listing. The service has no category search
 * endpoint, so we hydrate the (capped) category tree and filter by the editor's
 * search term client-side. Each option pins `categorySlug` to a concrete slug.
 */
export default defineActindoQueryTemplateProvider({
  for: ProductsByCategorySlugQuery,
  run: async ({ input, context }) => {
    try {
      const { ids } = await getAllCategoryIds(context.client);
      if (!ids.length) return [];

      const { items } = await getCategoriesBatch(context.client, ids.slice(0, ACTINDO_BATCH_LIMIT), { locale: context.locale });

      const term = input.term?.trim().toLowerCase();
      const matches = term ?
          items.filter(({ base }) => base.title.toLowerCase().includes(term) || base.slug.toLowerCase().includes(term))
        : items;

      const templates: RemoteQueryTemplate[] = matches.slice(0, MAX_TEMPLATES).map((category) => ({
        inputRules: {
          categorySlug: { literal: category.base.slug },
        },
        label: category.base.title,
      }));

      return templates;
    } catch {
      // An editor picker must never hard-fail the studio — degrade to no options.
      return [];
    }
  },
});

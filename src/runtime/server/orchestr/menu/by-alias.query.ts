import { MenuByAliasQuery } from '@laioutr-core/canonical-types/ecommerce';
import { isActindoNotFound } from '../../actindo-helper/errors';
import { flattenNavigation } from '../../actindo-helper/menu';
import { menuItemsFragmentToken } from '../../const/passthroughTokens';
import { defineActindoQuery } from '../../middleware/defineActindo';
import { getNavigation } from '../../queries/navigation';

/**
 * Navigation by alias (e.g. `main`) → a flat list of `MenuItem` ids. The tree
 * is flattened (hierarchy expressed via `childIds`/`parentId`) and forwarded to
 * the `MenuItem` resolver via passthrough. An unknown alias yields an empty menu.
 *
 * The menu lives in the (global) header, so its result is cached and reused
 * across pages. `includePassthrough: true` keeps the flattened nav attached to
 * the cached result — without it, a cache-restored render (e.g. the PDP) would
 * run the `MenuItem` resolver with empty passthrough and show no menu.
 */
export default defineActindoQuery({
  implements: MenuByAliasQuery,
  cache: {
    strategy: 'ttl',
    ttl: '10 minutes',
    buildCacheKey: ({ input }) => input.alias,
    includePassthrough: true,
  },
  run: async ({ input, context, passthrough }) => {
    try {
      const { items } = await getNavigation(context.client, input.alias, { locale: context.locale });
      const flattened = flattenNavigation(items);
      passthrough.set(menuItemsFragmentToken, flattened);
      return { ids: flattened.map((item) => item.id), total: flattened.length };
    } catch (error) {
      if (isActindoNotFound(error)) {
        passthrough.set(menuItemsFragmentToken, []);
        return { ids: [], total: 0 };
      }
      throw error;
    }
  },
});

import { MenuItemBase } from '@laioutr-core/canonical-types/entity/menuItem';
import { menuItemsFragmentToken } from '../../const/passthroughTokens';
import { defineActindoComponentResolver } from '../../middleware/defineActindo';
import { generateMenuItems } from '../../orchestr-helper/generateMenuItems';

/**
 * Hydrates `MenuItem` entities from the flattened navigation the `menu/by-alias`
 * query forwarded via passthrough.
 */
export default defineActindoComponentResolver({
  label: 'Actindo Menu Connector',
  entityType: 'MenuItem',
  provides: [MenuItemBase],
  resolve: async ({ passthrough }) => ({
    entities: generateMenuItems(passthrough.get(menuItemsFragmentToken) ?? []),
  }),
});

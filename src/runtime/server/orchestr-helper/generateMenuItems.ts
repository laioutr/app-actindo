import { $entity } from '#imports';
import { MenuItemBase } from '@laioutr-core/canonical-types/entity/menuItem';
import type { FlattenedActindoNavItem } from '../types/actindo';
import { mapLink } from '../actindo-helper/link';

/**
 * Map flattened navigation nodes into canonical `MenuItem` entities. A node with
 * a resolvable link becomes a `link` item (its `reference` link is mapped by the
 * link resolver to the target route, e.g. a category PLP); one without becomes a
 * non-navigable `folder`.
 */
export const generateMenuItems = (items: FlattenedActindoNavItem[]) =>
  items.map((item) => {
    const link = mapLink(item.link);

    return $entity([MenuItemBase], {
      id: item.id,
      base: link
        ? { type: 'link', name: item.label, link, childIds: item.childIds, parentId: item.parentId }
        : { type: 'folder', name: item.label, childIds: item.childIds, parentId: item.parentId },
    });
  });

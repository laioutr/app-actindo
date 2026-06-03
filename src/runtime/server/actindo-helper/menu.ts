import type { ActindoNavItem, FlattenedActindoNavItem } from '../types/actindo';

/**
 * Flatten the recursive navigation tree into a flat list of nodes that express
 * hierarchy by id (`childIds` / `parentId`) — the shape the self-referential
 * canonical `MenuItem` entity needs.
 */
export function flattenNavigation(items: ActindoNavItem[], parentId?: string): FlattenedActindoNavItem[] {
  const flattened: FlattenedActindoNavItem[] = [];

  for (const item of items) {
    const children = item.base.children ?? [];
    const childIds = children.map((child) => child.id);

    flattened.push({
      id: item.id,
      label: item.base.label,
      link: item.base.link,
      childIds: childIds.length ? childIds : undefined,
      parentId,
    });

    if (children.length) {
      flattened.push(...flattenNavigation(children, item.id));
    }
  }

  return flattened;
}

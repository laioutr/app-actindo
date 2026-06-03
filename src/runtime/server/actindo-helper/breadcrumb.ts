import { mapLink } from './link';
import type { ActindoBreadcrumbItem } from '../types/actindo';
import type { Link } from '@laioutr-core/core-types/common';

/** Map an Actindo breadcrumb step to the canonical `BreadcrumbItemBase` value (`label` → `name`). */
export function mapBreadcrumbBase(item: ActindoBreadcrumbItem): { name: string; link?: Link } {
  return {
    name: item.label,
    link: mapLink(item.link),
  };
}

/**
 * Expand a path-like category slug into its ancestor trail, root → self.
 * `damen/accessoires/guertel` → `['damen', 'damen/accessoires', 'damen/accessoires/guertel']`.
 * (Actindo category ids are their slugs, and slugs encode the hierarchy.)
 */
export function ancestorSlugs(slug: string): string[] {
  const segments = slug.split('/').filter(Boolean);
  return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
}

/** Last-segment fallback label when a category title can't be resolved (`muetzen-caps` → `Muetzen Caps`). */
export function humanizeSlug(slug: string): string {
  return (slug.split('/').pop() ?? slug).replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

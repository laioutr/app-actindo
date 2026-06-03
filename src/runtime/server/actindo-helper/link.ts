import type { ActindoLink } from '../types/actindo';
import type { Link, WellKnownReferenceType } from '@laioutr-core/core-types/common';

/**
 * Map an Actindo link to a canonical `Link`, or `undefined` when the source
 * lacks the fields the canonical variant requires.
 *
 * The service emits `url` / `anchor` / `reference` with full data. `page` and
 * `pageType` cannot be reconstructed from the DTO (no page id / page-type key),
 * so they degrade to a `url` when an `href` is present, otherwise to `undefined`.
 */
export function mapLink(link: ActindoLink | undefined): Link | undefined {
  if (!link) return undefined;

  switch (link.type) {
    case 'url':
      return link.href ? { type: 'url', href: link.href } : undefined;
    case 'anchor':
      return link.fragment ? { type: 'anchor', fragment: link.fragment } : undefined;
    case 'reference': {
      // Navigation references carry `id` (the category slug) without a separate
      // `slug`; detail/breadcrumb references carry both — accept either.
      const slug = link.reference?.slug ?? link.reference?.id;
      return slug ?
          {
            type: 'reference',
            reference: {
              type: (link.reference?.type ?? '') as WellKnownReferenceType,
              slug,
              id: link.reference?.id,
            },
          }
        : undefined;
    }
    case 'page':
    case 'pageType':
      // Not reconstructable from the DTO — fall back to a plain URL if we have one.
      return link.href ? { type: 'url', href: link.href } : undefined;
    default:
      return undefined;
  }
}

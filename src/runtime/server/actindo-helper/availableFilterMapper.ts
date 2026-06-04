import type { ActindoFacet } from '../types/actindo';
import type { AvailableFilter } from '@laioutr-core/orchestr/types';

/**
 * Map Actindo facets to canonical `AvailableFilter[]`.
 *
 * `list`, `boolean` and `range` facets map cleanly. `intervals` facets are
 * skipped: the service's facet DTO does not expose the per-interval bounds the
 * canonical `AvailableFilterIntervals` requires.
 */
export function mapAvailableFilters(facets: ActindoFacet[] | undefined): AvailableFilter[] {
  const result: AvailableFilter[] = [];

  for (const facet of facets ?? []) {
    switch (facet.type) {
      case 'list':
        result.push({
          id: facet.id,
          label: facet.label,
          type: 'list',
          presentation: facet.presentation ?? 'text',
          wellKnownName: facet.wellKnownName,
          values: (facet.values ?? []).map((value) => ({
            id: value.id,
            label: value.label,
            count: value.count,
          })),
        });
        break;
      case 'boolean':
        result.push({
          id: facet.id,
          label: facet.label,
          type: 'boolean',
          wellKnownName: facet.wellKnownName,
        });
        break;
      case 'range':
        if (facet.min !== undefined || facet.max !== undefined) {
          result.push({
            id: facet.id,
            label: facet.label,
            type: 'range',
            wellKnownName: facet.wellKnownName,
            min: facet.min ?? 0,
            max: facet.max ?? 0,
          });
        }
        break;
      case 'intervals':
      default:
        // Unsupported by the current DTO — intentionally skipped.
        break;
    }
  }

  return result;
}

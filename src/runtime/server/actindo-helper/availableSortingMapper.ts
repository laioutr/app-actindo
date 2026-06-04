import type { ActindoSorting } from '../types/actindo';
import type { AvailableSorting } from '@laioutr-core/orchestr/types';

/** Map Actindo listing sortings to canonical `AvailableSorting[]` (`id` → `key`). */
export function mapAvailableSortings(sortings: ActindoSorting[] | undefined): AvailableSorting[] {
  return (sortings ?? []).map((sorting) => ({
    key: sorting.id,
    label: sorting.label,
  }));
}

import { mapMediaImage } from './media';
import type { ActindoSwatch } from '../types/actindo';
import type { Swatch } from '@laioutr-core/core-types/common';

/** Map an Actindo swatch to a canonical `Swatch` tuple, or `undefined` if underspecified. */
export function mapSwatch(swatch: ActindoSwatch | undefined): Swatch | undefined {
  if (!swatch) return undefined;

  switch (swatch.type) {
    case 'color': {
      const color = swatch.colors?.[0];
      return color ? ['color', color] : undefined;
    }
    case 'colors':
      return swatch.colors?.length ? ['colors', swatch.colors] : undefined;
    case 'gradient':
      return swatch.colors?.length ? ['gradient', swatch.colors] : undefined;
    case 'thumbnail':
      return swatch.image ? ['image', mapMediaImage(swatch.image)] : undefined;
    default:
      return undefined;
  }
}

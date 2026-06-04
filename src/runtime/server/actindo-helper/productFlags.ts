import type { ActindoProduct } from '../types/actindo';

/** Map Actindo product flags (`{ label, style }`) to canonical flags (`{ variant, label }`). */
export function mapProductFlags(flags: ActindoProduct['flags']): Array<{ variant: string; label: string }> {
  return (flags ?? []).map((flag) => ({
    variant: flag.style ?? 'default',
    label: flag.label,
  }));
}

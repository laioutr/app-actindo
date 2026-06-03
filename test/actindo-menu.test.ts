import { describe, expect, it } from 'vitest';
import type { ActindoNavItem } from '../src/runtime/server/types/actindo';
import { flattenNavigation } from '../src/runtime/server/actindo-helper/menu';

const tree: ActindoNavItem[] = [
  {
    id: 'damen',
    base: {
      label: 'Damen',
      link: { type: 'reference', reference: { id: 'damen', type: 'Category' } },
      children: [
        {
          id: 'damen/accessoires',
          base: {
            label: 'Accessoires',
            children: [{ id: 'damen/accessoires/guertel', base: { label: 'Gürtel' } }],
          },
        },
      ],
    },
  },
  { id: 'herren', base: { label: 'Herren' } },
];

describe('flattenNavigation', () => {
  const flat = flattenNavigation(tree);

  it('emits every node depth-first', () => {
    expect(flat.map((i) => i.id)).toEqual(['damen', 'damen/accessoires', 'damen/accessoires/guertel', 'herren']);
  });

  it('wires childIds + parentId and carries label/link', () => {
    const damen = flat.find((i) => i.id === 'damen')!;
    expect(damen.parentId).toBeUndefined();
    expect(damen.childIds).toEqual(['damen/accessoires']);
    expect(damen.label).toBe('Damen');
    expect(damen.link).toEqual({ type: 'reference', reference: { id: 'damen', type: 'Category' } });

    const acc = flat.find((i) => i.id === 'damen/accessoires')!;
    expect(acc.parentId).toBe('damen');
    expect(acc.childIds).toEqual(['damen/accessoires/guertel']);

    const guertel = flat.find((i) => i.id === 'damen/accessoires/guertel')!;
    expect(guertel.parentId).toBe('damen/accessoires');
    expect(guertel.childIds).toBeUndefined();
  });

  it('leaves a top-level leaf without parentId/childIds', () => {
    const herren = flat.find((i) => i.id === 'herren')!;
    expect(herren.parentId).toBeUndefined();
    expect(herren.childIds).toBeUndefined();
  });
});

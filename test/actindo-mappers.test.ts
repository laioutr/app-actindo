import { describe, expect, it } from 'vitest';
import type { ActindoAvailability, ActindoFacet, ActindoMediaImage, ActindoProduct, ActindoSwatch, ActindoVariant } from '../src/runtime/server/types/actindo';
import { mapAvailableFilters } from '../src/runtime/server/actindo-helper/availableFilterMapper';
import { mapAvailableSortings } from '../src/runtime/server/actindo-helper/availableSortingMapper';
import { ancestorSlugs, humanizeSlug, mapBreadcrumbBase } from '../src/runtime/server/actindo-helper/breadcrumb';
import { mapLink } from '../src/runtime/server/actindo-helper/link';
import { mapMediaImage } from '../src/runtime/server/actindo-helper/media';
import { deriveOptionGroupsFromVariants, mapNativeOptionGroups, mapProductOptionGroups } from '../src/runtime/server/actindo-helper/optionGroups';
import { mapProductFlags } from '../src/runtime/server/actindo-helper/productFlags';
import { mapSwatch } from '../src/runtime/server/actindo-helper/swatch';
import { guessWellKnownName } from '../src/runtime/server/actindo-helper/wellKnownOptionName';

describe('mapMediaImage', () => {
  it('normalises any per-tenant provider tag to the registered `actindo` provider', () => {
    // The service's `provider` is tenant-specific (e.g. `robert-ley`, or anything
    // else per tenant). It is NOT a registered Nuxt Image provider, so the mapper
    // discards it and pins every source to `actindo` (a passthrough for the
    // absolute `src`). This must hold for arbitrary tenant values.
    for (const tenantProvider of ['robert-ley', 'some-other-tenant', 'whatever-cdn']) {
      expect(mapMediaImage({ type: 'image', sources: [{ provider: tenantProvider, src: '/a.jpg' }] })).toEqual({
        type: 'image',
        alt: undefined,
        sources: [{ provider: 'actindo', src: '/a.jpg', width: undefined, height: undefined }],
      });
    }
  });

  it('carries width, height and alt when present', () => {
    expect(
      mapMediaImage({ type: 'image', alt: 'Shoe', sources: [{ provider: 'robert-ley', src: '/a.jpg', width: 800, height: 600 }] }),
    ).toEqual({
      type: 'image',
      alt: 'Shoe',
      sources: [{ provider: 'actindo', src: '/a.jpg', width: 800, height: 600 }],
    });
  });
});

describe('mapLink', () => {
  it('maps url, anchor and reference links', () => {
    expect(mapLink({ type: 'url', href: 'https://example.com' })).toEqual({ type: 'url', href: 'https://example.com' });
    expect(mapLink({ type: 'anchor', fragment: 'section' })).toEqual({ type: 'anchor', fragment: 'section' });
    expect(mapLink({ type: 'reference', reference: { type: 'Category', slug: 'shoes', id: 'c1' } })).toEqual({
      type: 'reference',
      reference: { type: 'Category', slug: 'shoes', id: 'c1' },
    });
  });

  it('uses reference.id as the slug when slug is absent (navigation links)', () => {
    expect(mapLink({ type: 'reference', reference: { id: 'damen', type: 'Category' } })).toEqual({
      type: 'reference',
      reference: { type: 'Category', slug: 'damen', id: 'damen' },
    });
  });

  it('falls back page/pageType links to a url when an href exists', () => {
    expect(mapLink({ type: 'page', href: '/p' })).toEqual({ type: 'url', href: '/p' });
  });

  it('returns undefined when required fields are missing', () => {
    expect(mapLink(undefined)).toBeUndefined();
    expect(mapLink({ type: 'url' })).toBeUndefined();
    expect(mapLink({ type: 'reference', reference: { type: 'Category' } })).toBeUndefined();
  });
});

describe('mapProductFlags', () => {
  it('maps style to variant with a default', () => {
    expect(mapProductFlags([{ label: 'Sale', style: 'sale' }, { label: 'New' }])).toEqual([
      { variant: 'sale', label: 'Sale' },
      { variant: 'default', label: 'New' },
    ]);
  });

  it('returns an empty array when there are no flags', () => {
    expect(mapProductFlags(undefined)).toEqual([]);
  });
});

describe('mapSwatch', () => {
  it('maps each swatch type to its canonical tuple', () => {
    expect(mapSwatch({ type: 'color', colors: ['#f00'] })).toEqual(['color', '#f00']);
    expect(mapSwatch({ type: 'colors', colors: ['#f00', '#0f0'] })).toEqual(['colors', ['#f00', '#0f0']]);
    expect(mapSwatch({ type: 'gradient', colors: ['#f00', '#0f0'] })).toEqual(['gradient', ['#f00', '#0f0']]);
    expect(mapSwatch({ type: 'thumbnail', image: { type: 'image', sources: [{ provider: 'robert-ley', src: '/s.jpg' }] } })).toEqual([
      'image',
      { type: 'image', alt: undefined, sources: [{ provider: 'actindo', src: '/s.jpg', width: undefined, height: undefined }] },
    ]);
  });

  it('returns undefined when underspecified', () => {
    expect(mapSwatch(undefined)).toBeUndefined();
    expect(mapSwatch({ type: 'color', colors: [] })).toBeUndefined();
    expect(mapSwatch({ type: 'thumbnail' })).toBeUndefined();
  });
});

describe('mapBreadcrumbBase', () => {
  it('renames label to name and maps the link', () => {
    expect(mapBreadcrumbBase({ id: 'b1', label: 'Shoes', link: { type: 'url', href: '/shoes' } })).toEqual({
      name: 'Shoes',
      link: { type: 'url', href: '/shoes' },
    });
  });

  it('leaves the link undefined when absent', () => {
    expect(mapBreadcrumbBase({ id: 'b1', label: 'Home' })).toEqual({ name: 'Home', link: undefined });
  });
});

describe('ancestorSlugs', () => {
  it('expands a path slug into its root→self trail', () => {
    expect(ancestorSlugs('damen/accessoires/guertel')).toEqual(['damen', 'damen/accessoires', 'damen/accessoires/guertel']);
    expect(ancestorSlugs('herren')).toEqual(['herren']);
    expect(ancestorSlugs('')).toEqual([]);
  });
});

describe('humanizeSlug', () => {
  it('title-cases the last segment as a fallback label', () => {
    expect(humanizeSlug('damen/accessoires/muetzen-caps')).toBe('Muetzen Caps');
    expect(humanizeSlug('herren')).toBe('Herren');
  });
});

describe('mapAvailableSortings', () => {
  it('maps id to key', () => {
    expect(mapAvailableSortings([{ id: 'price:asc', label: 'Price' }])).toEqual([{ key: 'price:asc', label: 'Price' }]);
    expect(mapAvailableSortings(undefined)).toEqual([]);
  });
});

describe('mapAvailableFilters', () => {
  it('maps list, boolean and range facets and skips intervals', () => {
    const facets: ActindoFacet[] = [
      { id: 'color', label: 'Color', type: 'list', presentation: 'swatch', wellKnownName: 'color', values: [{ id: 'red', label: 'Red', count: 3 }] },
      { id: 'inStock', label: 'In stock', type: 'boolean' },
      { id: 'price', label: 'Price', type: 'range', min: { amount: 1000, currency: 'EUR' }, max: { amount: 5000, currency: 'EUR' } },
      { id: 'size', label: 'Size', type: 'intervals' },
    ];

    expect(mapAvailableFilters(facets)).toEqual([
      { id: 'color', label: 'Color', type: 'list', presentation: 'swatch', wellKnownName: 'color', values: [{ id: 'red', label: 'Red', count: 3 }] },
      { id: 'inStock', label: 'In stock', type: 'boolean', wellKnownName: undefined },
      { id: 'price', label: 'Price', type: 'range', wellKnownName: undefined, min: { amount: 1000, currency: 'EUR' }, max: { amount: 5000, currency: 'EUR' } },
    ]);
  });

  it('defaults list presentation to text and skips range facets without bounds', () => {
    expect(mapAvailableFilters([{ id: 'brand', label: 'Brand', type: 'list', values: [] }])).toEqual([
      { id: 'brand', label: 'Brand', type: 'list', presentation: 'text', wellKnownName: undefined, values: [] },
    ]);
    expect(mapAvailableFilters([{ id: 'weight', label: 'Weight', type: 'range' }])).toEqual([]);
  });
});

/** Build an Actindo variant carrying the given selected options. */
const variant = (
  id: string,
  selected: Array<{ name: string; value: string; wellKnownName?: string }>,
  extra: { status?: ActindoAvailability['status']; swatch?: ActindoSwatch; image?: ActindoMediaImage } = {},
): ActindoVariant => ({
  id,
  base: { name: id, sku: id },
  options: { selected, swatch: extra.swatch, image: extra.image },
  ...(extra.status ? { availability: { status: extra.status, quantity: 1 } } : {}),
});

const product = (extra: Partial<ActindoProduct> = {}): ActindoProduct => ({ id: 'p1', base: { name: 'Product', slug: 'product' }, ...extra });

describe('deriveOptionGroupsFromVariants', () => {
  it('folds axes and values out of the variants in first-encounter order', () => {
    const groups = deriveOptionGroupsFromVariants([
      variant('v1', [
        { name: 'color', value: 'white', wellKnownName: 'color' },
        { name: 'size', value: '110' },
      ]),
      variant('v2', [
        { name: 'color', value: 'white', wellKnownName: 'color' },
        { name: 'size', value: '90' },
      ]),
      variant('v3', [
        { name: 'color', value: 'navy', wellKnownName: 'color' },
        { name: 'size', value: '110' },
      ]),
    ]);

    // `size` carries no wellKnownName from the service — it is guessed from the
    // axis name, which is why a size selector can find its axis at all.
    expect(groups).toEqual({
      groups: [
        {
          name: 'color',
          wellKnownName: 'color',
          values: [
            { value: 'white', variantId: 'v1' },
            { value: 'navy', variantId: 'v3' },
          ],
        },
        {
          name: 'size',
          wellKnownName: 'size',
          values: [
            { value: '110', variantId: 'v1' },
            { value: '90', variantId: 'v2' },
          ],
        },
      ],
    });
  });

  it('names the first variant carrying a value, sold out or not', () => {
    const groups = deriveOptionGroupsFromVariants([
      variant('v1', [{ name: 'size', value: 'M' }], { status: 'outOfStock' }),
      variant('v2', [{ name: 'size', value: 'M' }], { status: 'inStock' }),
    ]);

    expect(groups.groups[0]?.values[0]).toMatchObject({ value: 'M', variantId: 'v1', available: true });
  });

  it('marks a value unavailable only when every variant carrying it is out of stock', () => {
    const groups = deriveOptionGroupsFromVariants([
      variant('v1', [{ name: 'size', value: 'S' }], { status: 'outOfStock' }),
      variant('v2', [{ name: 'size', value: 'M' }], { status: 'outOfStock' }),
      variant('v3', [{ name: 'size', value: 'M' }], { status: 'backorder' }),
    ]);

    expect(groups.groups[0]?.values).toEqual([
      { value: 'S', variantId: 'v1', available: false },
      { value: 'M', variantId: 'v2', available: true },
    ]);
  });

  it('leaves `available` undefined when no variant reports stock', () => {
    // Canonical reads absent as unknown ⇒ available. Collapsing it to `false`
    // would grey out every size on a tenant that publishes no availability.
    const groups = deriveOptionGroupsFromVariants([variant('v1', [{ name: 'size', value: 'M' }])]);

    expect(groups.groups[0]?.values[0]?.available).toBeUndefined();
  });

  it('attaches a variant swatch to the colour axis, never to another axis', () => {
    const groups = deriveOptionGroupsFromVariants([
      variant(
        'v1',
        [
          { name: 'color', value: 'red', wellKnownName: 'color' },
          { name: 'size', value: 'M' },
        ],
        { swatch: { type: 'color', colors: ['#f00'] } },
      ),
    ]);

    expect(groups.groups[0]).toMatchObject({ name: 'color', values: [{ value: 'red', swatch: ['color', '#f00'] }] });
    expect(groups.groups[1]?.values[0]?.swatch).toBeUndefined();
  });

  it('attaches the swatch to the sole axis of a single-axis product', () => {
    const groups = deriveOptionGroupsFromVariants([variant('v1', [{ name: 'Farbton', value: 'clay' }], { swatch: { type: 'color', colors: ['#b55'] } })]);

    expect(groups.groups[0]?.values[0]?.swatch).toEqual(['color', '#b55']);
  });

  it('drops the swatch on a multi-axis product with no colour axis', () => {
    // Attribution would be a guess, and a colour swatch on a size chip is worse
    // than no swatch at all.
    const groups = deriveOptionGroupsFromVariants([
      variant(
        'v1',
        [
          { name: 'size', value: 'M' },
          { name: 'length', value: '32' },
        ],
        { swatch: { type: 'color', colors: ['#f00'] } },
      ),
    ]);

    expect(groups.groups.every((group) => group.values.every((value) => value.swatch === undefined))).toBe(true);
  });

  it('returns no groups for variants without options, and for no variants', () => {
    expect(deriveOptionGroupsFromVariants([{ id: 'v1', base: { name: 'v1', sku: 'v1' } }])).toEqual({ groups: [] });
    expect(deriveOptionGroupsFromVariants([])).toEqual({ groups: [] });
  });
});

describe('mapNativeOptionGroups', () => {
  it('translates a native block onto the canonical shape', () => {
    expect(
      mapNativeOptionGroups({
        groups: [
          {
            name: 'Farbe',
            values: [
              { value: 'red', variantId: 'v1', available: true, swatch: { type: 'color', colors: ['#f00'] } },
              { value: 'blue', image: { type: 'image', sources: [{ provider: 'robert-ley', src: '/b.jpg' }] } },
            ],
          },
        ],
      }),
    ).toEqual({
      groups: [
        {
          // No wellKnownName on the block — guessed from the localized axis name.
          name: 'Farbe',
          wellKnownName: 'color',
          values: [
            { value: 'red', variantId: 'v1', available: true, swatch: ['color', '#f00'], image: undefined },
            {
              value: 'blue',
              variantId: undefined,
              available: undefined,
              swatch: undefined,
              image: { type: 'image', alt: undefined, sources: [{ provider: 'actindo', src: '/b.jpg', width: undefined, height: undefined }] },
            },
          ],
        },
      ],
    });
  });
});

describe('mapProductOptionGroups', () => {
  const variants = [variant('v1', [{ name: 'size', value: 'M' }])];

  it('prefers a native block over the variants', () => {
    // The seam that makes this forward-compatible: the day Actindo sends the
    // block, it wins outright and the derived path stops being consulted.
    const native = { groups: [{ name: 'Farbe', values: [{ value: 'red' }] }] };

    expect(mapProductOptionGroups(product({ optionGroups: native }), variants)).toEqual({
      groups: [{ name: 'Farbe', wellKnownName: 'color', values: [{ value: 'red', variantId: undefined, available: undefined, swatch: undefined, image: undefined }] }],
    });
  });

  it('derives from the variants when there is no native block', () => {
    expect(mapProductOptionGroups(product(), variants)).toEqual({ groups: [{ name: 'size', wellKnownName: 'size', values: [{ value: 'M', variantId: 'v1' }] }] });
  });

  it('returns no groups when neither source is present', () => {
    expect(mapProductOptionGroups(product(), undefined)).toEqual({ groups: [] });
  });
});

describe('guessWellKnownName', () => {
  it('folds casing, diacritics and ß onto one key', () => {
    expect(guessWellKnownName('Größe')).toBe('size');
    expect(guessWellKnownName('GRÖSSE')).toBe('size');
    expect(guessWellKnownName('  grosse  ')).toBe('size');
    expect(guessWellKnownName('Farbe')).toBe('color');
    expect(guessWellKnownName('Colour')).toBe('color');
  });

  it('returns undefined for an axis it does not recognise', () => {
    expect(guessWellKnownName('Stutzengröße')).toBeUndefined();
    expect(guessWellKnownName('')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import type { ActindoFacet } from '../src/runtime/server/types/actindo';
import { mapAvailableFilters } from '../src/runtime/server/actindo-helper/availableFilterMapper';
import { mapAvailableSortings } from '../src/runtime/server/actindo-helper/availableSortingMapper';
import { ancestorSlugs, humanizeSlug, mapBreadcrumbBase } from '../src/runtime/server/actindo-helper/breadcrumb';
import { mapLink } from '../src/runtime/server/actindo-helper/link';
import { mapMediaImage } from '../src/runtime/server/actindo-helper/media';
import { mapProductFlags } from '../src/runtime/server/actindo-helper/productFlags';
import { mapSwatch } from '../src/runtime/server/actindo-helper/swatch';

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

import { describe, expect, it, vi } from 'vitest';
import type { ActindoClient } from '../src/runtime/server/client/actindoClient';
import { isActindoNotFound } from '../src/runtime/server/actindo-helper/errors';
import { getCategoriesBatch } from '../src/runtime/server/queries/category';
import { getProductBySlug, getProductsBatch, getProductsByCategorySlug, searchProducts } from '../src/runtime/server/queries/product';
import { getVariantIdsByProduct } from '../src/runtime/server/queries/product-variant';

// A minimal client whose `request` we can inspect; the query layer only uses `request`.
function createClientMock() {
  const request = vi.fn().mockResolvedValue({});
  const client = { request } as unknown as ActindoClient;
  return { client, request };
}

describe('getProductBySlug', () => {
  it('encodes the slug and forwards locale/currency/expand', async () => {
    const { client, request } = createClientMock();
    await getProductBySlug(client, 'men/shoes', { locale: 'de-DE', currency: 'EUR', expand: true });

    expect(request).toHaveBeenCalledWith('/v1/products/by-slug/men%2Fshoes', {
      method: 'GET',
      query: { locale: 'de-DE', currency: 'EUR', expand: '1' },
    });
  });

  it('omits expand and empty options', async () => {
    const { client, request } = createClientMock();
    await getProductBySlug(client, 'shoe');

    expect(request).toHaveBeenCalledWith('/v1/products/by-slug/shoe', { method: 'GET', query: {} });
  });
});

describe('searchProducts', () => {
  it('POSTs to the search endpoint and omits undefined body fields', async () => {
    const { client, request } = createClientMock();
    await searchProducts(client, { q: 'boot', limit: 12, offset: 0, locale: 'de-DE', currency: 'EUR' });

    expect(request).toHaveBeenCalledWith('/v1/products/search', {
      method: 'POST',
      body: { q: 'boot', limit: 12, offset: 0, locale: 'de-DE', currency: 'EUR' },
    });
    // `sort` and `filter` were undefined and must not be sent.
    const body = request.mock.calls[0]![1]!.body as Record<string, unknown>;
    expect('sort' in body).toBe(false);
    expect('filter' in body).toBe(false);
  });
});

describe('getProductsByCategorySlug', () => {
  it('serialises filters into bracketed query params', async () => {
    const { client, request } = createClientMock();
    await getProductsByCategorySlug(client, 'shoes', {
      sort: 'price:asc',
      limit: 24,
      offset: 24,
      locale: 'de-DE',
      filter: { color: ['red', 'blue'], inStock: true, price: { min: 1000, max: 5000 } },
    });

    expect(request).toHaveBeenCalledWith('/v1/categories/by-slug/shoes/products', {
      method: 'GET',
      query: {
        'filter[color]': ['red', 'blue'],
        'filter[inStock]': true,
        'filter[price][min]': 1000,
        'filter[price][max]': 5000,
        sort: 'price:asc',
        limit: 24,
        offset: 24,
        locale: 'de-DE',
      },
    });
  });

  it('drops empty list filters', async () => {
    const { client, request } = createClientMock();
    await getProductsByCategorySlug(client, 'shoes', { filter: { color: [] } });

    expect(request).toHaveBeenCalledWith('/v1/categories/by-slug/shoes/products', { method: 'GET', query: {} });
  });
});

describe('batch endpoints', () => {
  it('getProductsBatch sends ids + components in the body and locale/currency in the query', async () => {
    const { client, request } = createClientMock();
    await getProductsBatch(client, ['p1', 'p2'], { locale: 'de-DE', currency: 'EUR', components: ['base', 'prices'] });

    expect(request).toHaveBeenCalledWith('/v1/products/batch', {
      method: 'POST',
      query: { locale: 'de-DE', currency: 'EUR' },
      body: { ids: ['p1', 'p2'], components: ['base', 'prices'] },
    });
  });

  it('getProductsBatch omits the components key when not requested', async () => {
    const { client, request } = createClientMock();
    await getProductsBatch(client, ['p1']);

    const body = request.mock.calls[0]![1]!.body as Record<string, unknown>;
    expect(body).toEqual({ ids: ['p1'] });
  });

  it('getVariantIdsByProduct posts productIds', async () => {
    const { client, request } = createClientMock();
    await getVariantIdsByProduct(client, ['p1', 'p2']);

    expect(request).toHaveBeenCalledWith('/v1/products/variants/batch', { method: 'POST', body: { productIds: ['p1', 'p2'] } });
  });

  it('getCategoriesBatch sends ids and the locale query', async () => {
    const { client, request } = createClientMock();
    await getCategoriesBatch(client, ['c1'], { locale: 'de-DE' });

    expect(request).toHaveBeenCalledWith('/v1/categories/batch', {
      method: 'POST',
      query: { locale: 'de-DE' },
      body: { ids: ['c1'] },
    });
  });
});

describe('isActindoNotFound', () => {
  it('detects 404 from the various error shapes', () => {
    expect(isActindoNotFound({ statusCode: 404 })).toBe(true);
    expect(isActindoNotFound({ status: 404 })).toBe(true);
    expect(isActindoNotFound({ response: { status: 404 } })).toBe(true);
  });

  it('is false for other errors', () => {
    expect(isActindoNotFound({ statusCode: 500 })).toBe(false);
    expect(isActindoNotFound(new Error('boom'))).toBe(false);
    expect(isActindoNotFound(undefined)).toBe(false);
  });
});
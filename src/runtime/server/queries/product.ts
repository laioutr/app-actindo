/**
 * Product catalog calls against the Actindo Storefront Data Service.
 *
 * Thin, typed wrappers over {@link ActindoClient.request} — no canonical
 * mapping (that lives in `../actindo-helper` + `../orchestr-helper`). The
 * request-scoped client is passed in by the caller (handlers obtain it from
 * `context.client`, wired by `../middleware/defineActindo`).
 *
 * @see https://laioutr.actindo.com/docs
 */
import type { ActindoClient } from '../client/actindoClient';
import type {
  ActindoBreadcrumbResponse,
  ActindoIdPage,
  ActindoListingParams,
  ActindoLocaleContext,
  ActindoProductBySlugResponse,
  ActindoProductsBatchResponse,
} from '../types/actindo';
import { buildListingQuery, compact, compactBody } from '../actindo-helper/requestQuery';

/**
 * Resolve a product slug to its opaque id. Pass `expand: true` to hydrate the
 * full product inline (PDP path — avoids a follow-up batch round-trip).
 */
export function getProductBySlug(
  client: ActindoClient,
  slug: string,
  opts: ActindoLocaleContext & { expand?: boolean } = {},
): Promise<ActindoProductBySlugResponse> {
  return client.request<ActindoProductBySlugResponse>(`/v1/products/by-slug/${encodeURIComponent(slug)}`, {
    method: 'GET',
    query: compact({
      ...(opts.locale ? { locale: opts.locale } : {}),
      ...(opts.currency ? { currency: opts.currency } : {}),
      ...(opts.expand ? { expand: '1' } : {}),
    }),
  });
}

/** Full-text product search. Returns a page of ids (+ facets/sortings). */
export function searchProducts(client: ActindoClient, params: ActindoListingParams & { q: string }): Promise<ActindoIdPage> {
  return client.request<ActindoIdPage>('/v1/products/search', {
    method: 'POST',
    body: compactBody({
      q: params.q,
      sort: params.sort,
      limit: params.limit,
      offset: params.offset,
      locale: params.locale,
      currency: params.currency,
      filter: params.filter,
    }),
  });
}

/** Products within a category, addressed by category slug. Returns a page of ids. */
export function getProductsByCategorySlug(client: ActindoClient, slug: string, params: ActindoListingParams = {}): Promise<ActindoIdPage> {
  return client.request<ActindoIdPage>(`/v1/categories/by-slug/${encodeURIComponent(slug)}/products`, {
    method: 'GET',
    query: compact(buildListingQuery(params)),
  });
}

/** Products within a category, addressed by opaque category id. Returns a page of ids. */
export function getProductsByCategoryId(client: ActindoClient, id: string, params: ActindoListingParams = {}): Promise<ActindoIdPage> {
  return client.request<ActindoIdPage>(`/v1/categories/by-id/${encodeURIComponent(id)}/products`, {
    method: 'GET',
    query: compact(buildListingQuery(params)),
  });
}

/** Hydrate full products by id (max {@link ACTINDO_BATCH_LIMIT} per call). */
export function getProductsBatch(
  client: ActindoClient,
  ids: string[],
  opts: ActindoLocaleContext & { components?: string[] } = {},
): Promise<ActindoProductsBatchResponse> {
  return client.request<ActindoProductsBatchResponse>('/v1/products/batch', {
    method: 'POST',
    query: compact({
      ...(opts.locale ? { locale: opts.locale } : {}),
      ...(opts.currency ? { currency: opts.currency } : {}),
    }),
    body: compactBody({ ids, components: opts.components }),
  });
}

/** Resolve the breadcrumb trail for a single product. */
export function getProductBreadcrumb(client: ActindoClient, productId: string, opts: { locale?: string } = {}): Promise<ActindoBreadcrumbResponse> {
  return client.request<ActindoBreadcrumbResponse>(`/v1/products/${encodeURIComponent(productId)}/breadcrumb`, {
    method: 'GET',
    query: compact({ ...(opts.locale ? { locale: opts.locale } : {}) }),
  });
}

/**
 * Category catalog calls against the Actindo Storefront Data Service.
 * Thin, typed wrappers over {@link ActindoClient.request}.
 *
 * @see https://laioutr.actindo.com/docs
 */
import type { ActindoClient } from '../client/actindoClient';
import type { ActindoCategoriesBatchResponse, ActindoCategoryBySlugResponse, ActindoCategoryIdsResponse } from '../types/actindo';
import { compact, compactBody } from '../actindo-helper/requestQuery';

/** Resolve a category slug to its opaque id. */
export function getCategoryBySlug(client: ActindoClient, slug: string, opts: { locale?: string } = {}): Promise<ActindoCategoryBySlugResponse> {
  return client.request<ActindoCategoryBySlugResponse>(`/v1/categories/by-slug/${encodeURIComponent(slug)}`, {
    method: 'GET',
    query: compact({ ...(opts.locale ? { locale: opts.locale } : {}) }),
  });
}

/** All category ids for the tenant (the full tree, flattened to ids). */
export function getAllCategoryIds(client: ActindoClient): Promise<ActindoCategoryIdsResponse> {
  return client.request<ActindoCategoryIdsResponse>('/v1/categories/', { method: 'GET' });
}

/** Hydrate full categories by id (max {@link ACTINDO_BATCH_LIMIT} per call). */
export function getCategoriesBatch(
  client: ActindoClient,
  ids: string[],
  opts: { locale?: string; components?: string[] } = {},
): Promise<ActindoCategoriesBatchResponse> {
  return client.request<ActindoCategoriesBatchResponse>('/v1/categories/batch', {
    method: 'POST',
    query: compact({ ...(opts.locale ? { locale: opts.locale } : {}) }),
    body: compactBody({ ids, components: opts.components }),
  });
}

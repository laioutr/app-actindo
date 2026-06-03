/**
 * Product-variant + availability calls against the Actindo Storefront Data
 * Service. Thin, typed wrappers over {@link ActindoClient.request}.
 *
 * @see https://laioutr.actindo.com/docs
 */
import type { ActindoClient } from '../client/actindoClient';
import type {
  ActindoAvailabilityBatchResponse,
  ActindoLocaleContext,
  ActindoVariantIdsByProductResponse,
  ActindoVariantsBatchResponse,
} from '../types/actindo';
import { compact, compactBody } from '../actindo-helper/requestQuery';

/** Resolve the variant ids belonging to each given product. */
export function getVariantIdsByProduct(client: ActindoClient, productIds: string[]): Promise<ActindoVariantIdsByProductResponse> {
  return client.request<ActindoVariantIdsByProductResponse>('/v1/products/variants/batch', {
    method: 'POST',
    body: { productIds },
  });
}

/** Hydrate full variants by id (max {@link ACTINDO_BATCH_LIMIT} per call). */
export function getVariantsBatch(
  client: ActindoClient,
  ids: string[],
  opts: ActindoLocaleContext & { components?: string[] } = {},
): Promise<ActindoVariantsBatchResponse> {
  return client.request<ActindoVariantsBatchResponse>('/v1/variants/batch', {
    method: 'POST',
    query: compact({
      ...(opts.locale ? { locale: opts.locale } : {}),
      ...(opts.currency ? { currency: opts.currency } : {}),
    }),
    body: compactBody({ ids, components: opts.components }),
  });
}

/** Fetch live availability by variant id (max {@link ACTINDO_AVAILABILITY_BATCH_LIMIT} per call). */
export function getAvailabilityBatch(client: ActindoClient, ids: string[]): Promise<ActindoAvailabilityBatchResponse> {
  return client.request<ActindoAvailabilityBatchResponse>('/v1/availability/batch', {
    method: 'POST',
    body: { ids },
  });
}

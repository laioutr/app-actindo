import type { ActindoFilterInput, ActindoListingParams } from '../types/actindo';

type QueryValue = string | number | boolean | string[];
export type QueryRecord = Record<string, QueryValue>;

/**
 * Serialise a canonical filter record into the service's bracketed query
 * params: list facets repeat (`filter[color]=a&filter[color]=b`), booleans are
 * scalar (`filter[inStock]=true`), ranges split into `[min]`/`[max]`.
 */
export function buildFilterQuery(filter: ActindoFilterInput | undefined): QueryRecord {
  const query: QueryRecord = {};
  if (!filter) return query;

  for (const [key, value] of Object.entries(filter)) {
    if (Array.isArray(value)) {
      if (value.length) query[`filter[${key}]`] = value;
    } else if (typeof value === 'boolean') {
      query[`filter[${key}]`] = value;
    } else if (value && typeof value === 'object') {
      if (value.min !== undefined) query[`filter[${key}][min]`] = value.min;
      if (value.max !== undefined) query[`filter[${key}][max]`] = value.max;
    }
  }
  return query;
}

/** Build the shared `q`/`sort`/`limit`/`offset`/`locale`/`currency` + filter query for GET listings. */
export function buildListingQuery(params: ActindoListingParams): QueryRecord {
  const query: QueryRecord = { ...buildFilterQuery(params.filter) };
  if (params.q) query.q = params.q;
  if (params.sort) query.sort = params.sort;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.offset !== undefined) query.offset = params.offset;
  if (params.locale) query.locale = params.locale;
  if (params.currency) query.currency = params.currency;
  return query;
}

/** Drop empty/undefined entries so we never send empty query params. */
export function compact(query: QueryRecord): QueryRecord {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ''));
}

/** Drop `undefined` properties from a JSON body so optional params are omitted, not sent as `null`. */
export function compactBody<T extends Record<string, unknown>>(body: T): Partial<T> {
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined)) as Partial<T>;
}

/**
 * Navigation/menu calls against the Actindo Storefront Data Service.
 *
 * @see https://laioutr.actindo.com/docs
 */
import type { ActindoClient } from '../client/actindoClient';
import type { ActindoNavigationResponse } from '../types/actindo';
import { compact } from '../actindo-helper/requestQuery';

/** Fetch a navigation tree by its alias (e.g. `main`). */
export function getNavigation(client: ActindoClient, alias: string, opts: { locale?: string } = {}): Promise<ActindoNavigationResponse> {
  return client.request<ActindoNavigationResponse>(`/v1/navigation/${encodeURIComponent(alias)}`, {
    method: 'GET',
    query: compact({ ...(opts.locale ? { locale: opts.locale } : {}) }),
  });
}

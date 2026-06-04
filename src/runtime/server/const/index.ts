// Hard ceiling enforced by the service on `:batch` id lists (products/variants/categories).
export const ACTINDO_BATCH_LIMIT = 200;

// Hard ceiling enforced by the service on the availability `:batch` endpoint.
export const ACTINDO_AVAILABILITY_BATCH_LIMIT = 500;

// Service-side locale/currency fallbacks (the service default locale is `de-DE`).
export const DEFAULT_LOCALE = 'de-DE';
export const DEFAULT_CURRENCY = 'EUR';

// Synthetic id prefix for the (stateless) SuggestedSearch entity; the search
// term is recovered from the id by stripping this prefix.
export const SUGGESTED_SEARCH_ID_PREFIX = 'suggested-search:';

// How many product suggestions the header autocomplete requests.
export const SUGGESTED_SEARCH_LIMIT = 6;

// Navigation aliases offered as Studio template options for the menu query. The
// service has no "list aliases" endpoint; the query still accepts any alias, so
// extend this list as the tenant adds menus.
export const MENU_ALIASES = ['main'];

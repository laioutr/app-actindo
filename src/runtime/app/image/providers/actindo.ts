import type { ProviderGetImage } from '@nuxt/image';

/**
 * Nuxt Image provider for Actindo media.
 *
 * The Storefront Data Service emits absolute media URLs already hosted on the
 * tenant's CDN, so this provider passes the source through unchanged. Resizing
 * modifiers are intentionally not applied — the tenant media host's transform
 * API is not part of the service contract.
 *
 * @see https://image.nuxt.com/advanced/custom-provider
 */
export const getImage: ProviderGetImage = (src) => ({ url: src });

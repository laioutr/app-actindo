import {
  ProductVariantAvailability,
  ProductVariantBase,
  ProductVariantInfo,
  ProductVariantOptions,
  ProductVariantPrices,
  ProductVariantQuantityPrices,
  ProductVariantQuantityRule,
  ProductVariantShipping,
} from '@laioutr-core/canonical-types/entity/product-variant';
import { DEFAULT_CURRENCY } from '../../const';
import { defineActindoComponentResolver } from '../../middleware/defineActindo';
import { generateVariantComponents } from '../../orchestr-helper/generateProductVariantComponents';
import { getVariantsBatch } from '../../queries/product-variant';

/**
 * Hydrates the full canonical `ProductVariant` component set from
 * `/v1/variants/batch`. Providing every component avoids a
 * `NonResolvableComponentsError` when the PDP requests `quantityPrices` or
 * `shipping`. Variants are always fetched here (the service has no combined
 * product+variant endpoint to pre-load via passthrough).
 */
export default defineActindoComponentResolver({
  label: 'Actindo Product Variant Connector',
  entityType: 'ProductVariant',
  provides: [
    ProductVariantBase,
    ProductVariantInfo,
    ProductVariantOptions,
    ProductVariantPrices,
    ProductVariantAvailability,
    ProductVariantQuantityPrices,
    ProductVariantQuantityRule,
    ProductVariantShipping,
  ],
  cache: {
    ttl: '1 hour',
    components: {
      prices: { ttl: '5 minutes' },
      availability: { ttl: '1 minute' },
    },
  },
  resolve: async ({ entityIds, requestedComponents, context }) => {
    const { items } = await getVariantsBatch(context.client, entityIds, {
      locale: context.locale,
      currency: context.currency,
      components: requestedComponents,
    });

    return {
      entities: generateVariantComponents(items, context.currency || DEFAULT_CURRENCY),
    };
  },
});

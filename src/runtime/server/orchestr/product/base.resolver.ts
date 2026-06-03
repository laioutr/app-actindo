import {
  ProductBase,
  ProductBrand,
  ProductDefaultVariant,
  ProductDescription,
  ProductFlags,
  ProductInfo,
  ProductMedia,
  ProductPrices,
  ProductRating,
  ProductSeo,
} from '@laioutr-core/canonical-types/entity/product';
import { DEFAULT_CURRENCY } from '../../const';
import { productsFragmentToken } from '../../const/passthroughTokens';
import { defineActindoComponentResolver } from '../../middleware/defineActindo';
import { generateProductComponents } from '../../orchestr-helper/generateProductComponents';
import { getProductsBatch } from '../../queries/product';

/**
 * Hydrates `Product` entities. Reads products forwarded by a query handler via
 * passthrough (PDP path) and falls back to `/v1/products/batch` for listings,
 * cross-app composition and cache restore.
 */
export default defineActindoComponentResolver({
  label: 'Actindo Product Connector',
  entityType: 'Product',
  provides: [
    ProductBase,
    ProductDescription,
    ProductMedia,
    ProductInfo,
    ProductBrand,
    ProductPrices,
    ProductRating,
    ProductFlags,
    ProductDefaultVariant,
    ProductSeo,
  ],
  cache: {
    ttl: '1 hour',
    components: {
      // Prices move more often than catalog copy; refresh them more eagerly.
      prices: { ttl: '5 minutes' },
    },
  },
  resolve: async ({ entityIds, requestedComponents, context, passthrough }) => {
    const passedProducts = passthrough.get(productsFragmentToken);

    const products =
      passedProducts ??
      (
        await getProductsBatch(context.client, entityIds, {
          locale: context.locale,
          currency: context.currency,
          components: requestedComponents,
        })
      ).items;

    return {
      entities: generateProductComponents(products, context.currency || DEFAULT_CURRENCY),
    };
  },
});

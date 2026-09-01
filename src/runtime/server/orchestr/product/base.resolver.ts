import {
  ProductBase,
  ProductBrand,
  ProductDefaultVariant,
  ProductDescription,
  ProductFlags,
  ProductInfo,
  ProductMedia,
  ProductOptionGroups,
  ProductPrices,
  ProductRating,
  ProductSeo,
} from '@laioutr-core/canonical-types/entity/product';
import type { ActindoClient } from '../../client/actindoClient';
import type { ActindoProduct, ActindoVariant } from '../../types/actindo';
import { ACTINDO_BATCH_LIMIT, DEFAULT_CURRENCY } from '../../const';
import { productsFragmentToken } from '../../const/passthroughTokens';
import { defineActindoComponentResolver } from '../../middleware/defineActindo';
import { generateProductComponents } from '../../orchestr-helper/generateProductComponents';
import { getProductsBatch } from '../../queries/product';
import { getVariantIdsByProduct, getVariantsBatch } from '../../queries/product-variant';

const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));

/**
 * Load the variants needed to answer `optionGroups` and `defaultVariant`.
 *
 * Actindo exposes no product-level option matrix and sends only an `id` on
 * `defaultVariant`, so both components are folded out of the variants. The work
 * is skipped entirely when neither component was requested, and per product
 * when the product already carries the data — so the day the service grows a
 * native `optionGroups` block (or a richer `defaultVariant`), these round-trips
 * disappear on their own without a code change here.
 */
const loadVariants = async (
  client: ActindoClient,
  products: ActindoProduct[],
  requestedComponents: readonly string[],
  opts: { locale?: string; currency?: string },
): Promise<Map<string, ActindoVariant[]>> => {
  const byProduct = new Map<string, ActindoVariant[]>();

  // `optionGroups` needs every variant of a product; `defaultVariant` needs only
  // the one it names, and only to read a `sku`/`status` Actindo does not send.
  const needsAllVariants = requestedComponents.includes(ProductOptionGroups) ? products.filter((product) => !product.optionGroups) : [];
  const needsAllVariantIds = new Set(needsAllVariants.map((product) => product.id));

  const defaultVariantIdByProduct = new Map(
    (requestedComponents.includes(ProductDefaultVariant) ? products : [])
      .filter((product) => !needsAllVariantIds.has(product.id))
      .flatMap((product) => {
        const { id, sku, status } = product.defaultVariant ?? {};
        const alreadyComplete = sku !== undefined && status !== undefined;
        return id && !alreadyComplete ? [[product.id, id] as const] : [];
      }),
  );

  if (!needsAllVariants.length && !defaultVariantIdByProduct.size) return byProduct;

  let variantIdsByProduct = new Map<string, string[]>();
  if (needsAllVariants.length) {
    const { items } = await getVariantIdsByProduct(
      client,
      needsAllVariants.map((product) => product.id),
    );
    variantIdsByProduct = new Map(items.map((item) => [item.productId, item.variantIds]));
  }

  const ids = [...new Set([...[...variantIdsByProduct.values()].flat(), ...defaultVariantIdByProduct.values()])];
  if (!ids.length) return byProduct;

  const batches = await Promise.all(chunk(ids, ACTINDO_BATCH_LIMIT).map((batch) => getVariantsBatch(client, batch, opts)));
  const variantById = new Map(batches.flatMap(({ items }) => items).map((variant) => [variant.id, variant]));

  const collect = (variantIds: string[]) => variantIds.map((id) => variantById.get(id)).filter((variant): variant is ActindoVariant => !!variant);

  for (const product of needsAllVariants) byProduct.set(product.id, collect(variantIdsByProduct.get(product.id) ?? []));
  for (const [productId, variantId] of defaultVariantIdByProduct) byProduct.set(productId, collect([variantId]));

  return byProduct;
};

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
    ProductOptionGroups,
    ProductSeo,
  ],
  cache: {
    ttl: '1 hour',
    components: {
      // Prices move more often than catalog copy; refresh them more eagerly.
      prices: { ttl: '5 minutes' },
      // Both are partly stock-derived (`defaultVariant.status`, per-value
      // `available`), so they decay like prices rather than like catalog copy —
      // but they still carry stable structure, so not as eagerly.
      defaultVariant: { ttl: '15 minutes' },
      optionGroups: { ttl: '15 minutes' },
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

    const variantsByProduct = await loadVariants(context.client, products, requestedComponents, {
      locale: context.locale,
      currency: context.currency,
    });

    return {
      entities: generateProductComponents(products, context.currency || DEFAULT_CURRENCY, variantsByProduct),
    };
  },
});
